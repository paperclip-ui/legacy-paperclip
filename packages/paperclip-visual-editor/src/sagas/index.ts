import * as Mousetrap from "mousetrap";
import SockJSClient from "sockjs-client";
import { computeVirtJSObject, isPaperclipFile } from "paperclip-utils";
import * as Url from "url";
import { fork, put, take, takeEvery, select, call } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import {
  ActionType,
  ErrorBannerClicked,
  engineErrored,
  globalEscapeKeyPressed,
  globalBackspaceKeyPressed,
  globalMetaKeyDown,
  globalZKeyDown,
  globalYKeyDown,
  globalMetaKeyUp,
  Action,
  engineDelegateChanged,
  fileOpened,
  currentFileInitialized,
  pcVirtObjectEdited,
  CanvasMouseUp,
  pasted,
  globalBackspaceKeySent
} from "../actions";
import { Renderer } from "paperclip-web-renderer";
import { AppState, getNodeInfoAtPoint, getSelectedFrames } from "../state";
import { getVirtTarget } from "paperclip-utils";
import { handleCanvas } from "./canvas";
import { PCMutationActionKind } from "paperclip-source-writer/lib/mutations";
import { utimes } from "fs";

declare const vscode;
declare const TARGET_URI;
declare const PROTOCOL;

export default function* mainSaga() {
  yield fork(handleRenderer);
  yield takeEvery(ActionType.CANVAS_MOUSE_UP, handleCanvasMouseUp);
  yield takeEvery(ActionType.ERROR_BANNER_CLICKED, handleErrorBannerClicked);
  yield fork(handleKeyCommands);
  yield put(fileOpened({ uri: getTargetUrl() }));
  yield fork(handleCanvas);
  yield fork(handleClipboard);
}

const parent = typeof vscode != "undefined" ? vscode : window;

const getTargetUrl = () => {
  if (typeof TARGET_URI !== "undefined") {
    return TARGET_URI;
  }

  const parts = Url.parse(location.href, true);
  return parts.query.open;
};

function handleSock(onMessage, onClient) {
  if (!/^http/.test(location.protocol)) {
    return;
  }
  const client = new SockJSClient(
    location.protocol + "//" + location.host + "/rt"
  );

  client.onopen = () => {
    const url = getTargetUrl();
    if (url) {
      client.send(JSON.stringify({ type: "OPEN", uri: url }));
    }

    onClient({
      send: message => client.send(JSON.stringify(message))
    });
  };

  client.onmessage = message => {
    onMessage(JSON.parse(message.data));
  };

  return () => {
    client.close();
  };
}

function handleIPC(onMessage) {
  window.onmessage = ({ data: { type, payload } }: MessageEvent) => {
    if (!type) {
      return;
    }

    onMessage({
      type,
      payload: (payload && JSON.parse(payload)) || {}
    });
  };
}

function* handleRenderer() {
  let _client: any;

  const chan = eventChannel(emit => {
    const onMessage = ({ type, payload }) => {
      switch (type) {
        case "ENGINE_EVENT": {
          const engineEvent = payload;
          if (engineEvent.kind === "Error") {
            return emit(engineErrored(engineEvent));
          }

          emit(engineDelegateChanged(engineEvent));
          break;
        }
        case "INIT": {
          emit(currentFileInitialized(payload));
          break;
        }
        case "ERROR": {
          emit(engineErrored(payload));
          break;
        }

        // handle as regular action
        default: {
          emit({ type, payload });
          break;
        }
      }
    };

    handleIPC(onMessage);
    handleSock(onMessage, client => {
      _client = client;
    });
    return () => {
      window.onmessage = undefined;
    };
  });

  const sendMessage = message =>
    _client ? _client.send(message) : parent.postMessage(message);

  yield fork(function*() {
    while (1) {
      const action = yield take(chan);
      yield put(action);
    }
  });
  yield takeEvery(["FOCUS"], function() {
    window.focus();
  });

  yield takeEvery([ActionType.FS_ITEM_CLICKED], function*(action: Action) {
    if (
      action.type === ActionType.FS_ITEM_CLICKED &&
      isPaperclipFile(action.payload.url)
    ) {
      // renderer.reset(action.payload.url);
      yield put(fileOpened({ uri: getTargetUrl() }));
    }
    sendMessage(action);
  });

  yield takeEvery(
    [
      ActionType.RESIZER_STOPPED_MOVING,
      ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING,
      ActionType.FRAME_TITLE_CHANGED
    ],
    function*(action: Action) {
      const state: AppState = yield select();
      sendMessage(
        pcVirtObjectEdited({
          mutations: getSelectedFrames(state).map(frame => {
            return {
              exprSource: frame.source,
              action: {
                kind: PCMutationActionKind.ANNOTATIONS_CHANGED,
                annotationsSource: frame.annotations.source,
                annotations: computeVirtJSObject(frame.annotations)
              }
            };
          })
        })
      );
    }
  );

  yield takeEvery([ActionType.GLOBAL_BACKSPACE_KEY_PRESSED], function*() {
    const state: AppState = yield select();
    sendMessage(
      pcVirtObjectEdited({
        mutations: getSelectedFrames(state).map(frame => {
          return {
            exprSource: frame.source,
            action: {
              kind: PCMutationActionKind.EXPRESSION_DELETED
            }
          };
        })
      })
    );

    yield put(globalBackspaceKeySent(null));
  });

  yield takeEvery(
    [
      ActionType.META_CLICKED,
      ActionType.GLOBAL_Z_KEY_DOWN,
      ActionType.GLOBAL_Y_KEY_DOWN,
      ActionType.PASTED
    ],
    function(action: Action) {
      sendMessage(action);
    }
  );

  sendMessage({
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

function* handleCanvasMouseUp(action: CanvasMouseUp) {
  if (!action.payload.metaKey) {
    return;
  }

  const state: AppState = yield select();

  const nodePathParts = getNodeInfoAtPoint(
    state.canvas.mousePosition,
    state.canvas.transform,
    state.boxes
  )
    .nodePath.split(".")
    .map(Number);
  console.log(state.allLoadedPCFileData[state.currentFileUri], nodePathParts);
  const virtualNode = getVirtTarget(
    state.allLoadedPCFileData[state.currentFileUri].preview,
    nodePathParts
  );

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
    Mousetrap.bind("meta+z", () => {
      emit(globalZKeyDown(null));
    });
    Mousetrap.bind("meta+y", () => {
      emit(globalYKeyDown(null));
    });
    Mousetrap.bind("meta+shift+z", () => {
      emit(globalYKeyDown(null));
    });
    Mousetrap.bind("backspace", () => {
      emit(globalBackspaceKeyPressed(null));
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

function* handleClipboard() {
  yield fork(handleCopy);
  yield fork(handlePaste);
}
function* handleCopy() {
  const ev = eventChannel(emit => {
    window.document.addEventListener("copy", emit);
    return () => {
      window.document.removeEventListener("copy", emit);
    };
  });

  yield takeEvery(ev, function*(event: ClipboardEvent) {
    const state: AppState = yield select();
    const frames = getSelectedFrames(state);

    if (!frames.length) {
      return;
    }

    const buffer = ["\n\n"];

    for (const frame of frames) {
      if (!state.documentContent[frame.source.uri]) {
        console.warn(`document content doesn't exist`);
        return;
      }

      const start =
        frame.annotations?.source.location.start || frame.source.location.start;
      const end = frame.source.location.end;

      buffer.push(
        state.documentContent[frame.source.uri].slice(start, end),
        "\n"
      );
    }

    event.clipboardData.setData("text/plain", buffer.join("\n"));
    event.preventDefault();
  });
}

function* handlePaste() {
  const ev = eventChannel(emit => {
    window.document.addEventListener("paste", emit);
    return () => {
      window.document.removeEventListener("paste", emit);
    };
  });

  yield takeEvery(ev, function*(event: ClipboardEvent) {
    const content = event.clipboardData.getData("text/plain");
    event.preventDefault();
    if (content) {
      yield put(
        pasted({
          clipboardData: [
            {
              type: "text/plain",
              content
            }
          ]
        })
      );
    }
  });
}
