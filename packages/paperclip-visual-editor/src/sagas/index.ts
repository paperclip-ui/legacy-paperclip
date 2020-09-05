import * as Mousetrap from "mousetrap";
import * as Url from "url";
import SockJSClient from "sockjs-client";
import { fork, put, take, takeEvery, select, call } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import {
  rendererInitialized,
  rectsCaptured,
  ActionType,
  CanvasElementClicked,
  rendererChanged,
  ErrorBannerClicked,
  engineErrored,
  globalEscapeKeyPressed,
  globalMetaKeyDown,
  globalMetaKeyUp
} from "../actions";
import { Renderer } from "paperclip-web-renderer";
import { AppState } from "../state";
import { getVirtTarget } from "paperclip-utils";
import { render } from "react-dom";

declare const vscode;
declare const TARGET_URI;
declare const PROTOCOL;

export default function* mainSaga() {
  yield fork(handleRenderer);
  yield takeEvery(
    ActionType.CANVAS_ELEMENT_CLICKED,
    handleCanvasElementClicked
  );
  yield takeEvery(ActionType.ERROR_BANNER_CLICKED, handleErrorBannerClicked);
  yield fork(handleKeyCommands);
}

const parent = typeof vscode != "undefined" ? vscode : window;

const getTargetUrl = () => {
  if (typeof TARGET_URI !== "undefined") {
    return TARGET_URI;
  }

  const parts = Url.parse(location.href, true);
  return parts.query.open;
};

function handleSock(onMessage) {
  const client = new SockJSClient(
    location.protocol + "//" + location.host + "/rt"
  );

  client.onopen = () => {
    const url = getTargetUrl();
    if (url) {
      client.send(JSON.stringify({ type: "OPEN", uri: url }));
    }
  };

  client.onmessage = message => {
    console.log(message, message.data);
    onMessage(JSON.parse(message.data));
  };

  return () => {
    client.close();
  };
}

function handleIPC(onMessage) {
  window.onmessage = ({ data: { type, payload } }: MessageEvent) => {
    if (!type || !payload) {
      return;
    }

    onMessage({
      type,
      payload: JSON.parse(payload)
    });
  };
}

function* handleRenderer() {
  const renderer = new Renderer(
    typeof PROTOCOL === "undefined" ? "http://" : PROTOCOL,
    getTargetUrl()
  );

  const chan = eventChannel(emit => {
    let timer: any;

    const collectRects = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const scrollingElement =
          renderer.frame.contentDocument.scrollingElement;
        const scrollLeft = scrollingElement.scrollLeft;
        const scrollTop = scrollingElement.scrollTop;
        scrollingElement.scrollTop = 0;
        scrollingElement.scrollLeft = 0;

        emit(
          rectsCaptured({
            rects: renderer.getRects(),
            frameSize: renderer.frame.getBoundingClientRect(),
            scrollSize: {
              width: scrollingElement.scrollWidth,
              height: scrollingElement.scrollHeight
            }
          })
        );

        scrollingElement.scrollLeft = scrollLeft;
        scrollingElement.scrollTop = scrollTop;
      }, 100);
    };

    renderer.frame.addEventListener("load", () => {
      renderer.frame.contentWindow.addEventListener("resize", collectRects);
    });

    const onMessage = ({ type, payload }) => {
      if (type === "ENGINE_EVENT") {
        const engineEvent = payload;
        if (engineEvent.kind === "Error") {
          return emit(engineErrored(engineEvent));
        }
        renderer.handleEngineEvent(payload);
      } else if (type === "INIT") {
        renderer.initialize(payload);
      } else if (type === "ERROR") {
        // renderer.handleError(JSON.parse(payload));
        emit(engineErrored(payload));
        return;
      }

      emit(rendererChanged({ virtualRoot: renderer.virtualRootNode }));

      // we want to capture rects on _every_ change
      collectRects();
    };

    handleIPC(onMessage);
    handleSock(onMessage);
    return () => {
      window.onmessage = undefined;
    };
  });

  yield fork(function*() {
    while (1) {
      const action = yield take(chan);
      yield put(action);
    }
  });

  yield put(rendererInitialized({ element: renderer.frame }));
  yield fork(handleInteractionsForRenderer(renderer));

  parent.postMessage({
    type: "ready"
  });
}

const handleInteractionsForRenderer = (renderer: Renderer) =>
  function*() {
    function* syncScrollbarVisibilityState() {
      const state: AppState = yield select();
      renderer.hideScrollbars = state.toolsLayerEnabled;
    }

    yield call(syncScrollbarVisibilityState);
    yield takeEvery(
      ActionType.PAINT_BUTTON_CLICKED,
      syncScrollbarVisibilityState
    );
  };

function* handleCanvasElementClicked(action: CanvasElementClicked) {
  if (!action.payload.metaKey) {
    return;
  }

  const state: AppState = yield select();

  const nodePathParts = action.payload.nodePath.split(".").map(Number);
  const virtualNode = getVirtTarget(state.virtualRootNode, nodePathParts);

  parent.postMessage(
    {
      type: "metaElementClicked",
      source: virtualNode.source
    },
    location.origin
  );
}

function handleErrorBannerClicked({ payload: error }: ErrorBannerClicked) {
  parent.postMessage(
    {
      type: "errorBannerClicked",
      error
    },
    location.origin
  );
}

function* handleKeyCommands() {
  const chan = eventChannel(emit => {
    Mousetrap.bind("esc", () => {
      emit(globalEscapeKeyPressed(null));
    });
    Mousetrap.bind("meta", () => {
      emit(globalMetaKeyDown(null));
    });
    Mousetrap.bind(
      "meta",
      () => {
        emit(globalMetaKeyUp(null));
      },
      "keyup"
    );

    // eslint-disable-next-line
    return () => {};
  });

  while (1) {
    yield put(yield take(chan));
  }
}
