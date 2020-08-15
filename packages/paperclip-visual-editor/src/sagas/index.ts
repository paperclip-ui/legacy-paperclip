import { fork, put, take, takeEvery, select } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import {
  rendererInitialized,
  rectsCaptured,
  ActionType,
  CanvasElementClicked,
  rendererChanged,
  ErrorBannerClicked,
  engineErrored
} from "../actions";
import { Renderer } from "paperclip-web-renderer";
import { render } from "react-dom";
import { AppState } from "../state";
import {
  getVirtTarget,
  VirtualElement,
  EngineErrorEvent
} from "paperclip-utils";

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
}

const parent = typeof vscode != "undefined" ? vscode : window;

function* handleRenderer() {
  const renderer = new Renderer(
    typeof PROTOCOL === "undefined" ? "http://" : PROTOCOL,
    typeof TARGET_URI === "undefined" ? null : TARGET_URI
  );

  const chan = eventChannel(emit => {
    let timer: any;

    const onMessage = ({ data: { type, payload } }: MessageEvent) => {
      if (type === "ENGINE_EVENT") {
        const engineEvent = JSON.parse(payload);
        if (engineEvent.kind === "Error") {
          return emit(engineErrored(engineEvent));
        }
        renderer.handleEngineEvent(JSON.parse(payload));
      } else if (type === "INIT") {
        renderer.initialize(JSON.parse(payload));
      } else if (type === "ERROR") {
        // renderer.handleError(JSON.parse(payload));
        emit(engineErrored(JSON.parse(payload)));
        return;
      }

      emit(rendererChanged({ virtualRoot: renderer.virtualRootNode }));

      // we want to capture rects on _every_ change
      clearTimeout(timer);
      timer = setTimeout(() => {
        emit(rectsCaptured(renderer.getRects()));
      }, 100);
    };
    window.onmessage = onMessage;
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

  parent.postMessage({
    type: "ready"
  });
}

function* handleCanvasElementClicked(action: CanvasElementClicked) {
  if (!action.payload.metaKey) {
    // return;
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
