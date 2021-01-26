import Mousetrap, { addKeycodes } from "mousetrap";
import SockJSClient from "sockjs-client";
import { computeVirtJSObject } from "paperclip-utils";
import * as Url from "url";
import { fork, put, take, takeEvery, select, call } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import * as qs from "querystring";
import {
  ActionType,
  ErrorBannerClicked,
  globalEscapeKeyPressed,
  globalBackspaceKeyPressed,
  globalMetaKeyDown,
  globalZKeyDown,
  globalYKeyDown,
  globalMetaKeyUp,
  Action,
  fileOpened,
  pcVirtObjectEdited,
  CanvasMouseUp,
  pasted,
  globalBackspaceKeySent,
  globalSaveKeyPress,
  globalHKeyDown,
  locationChanged,
  clientConnected,
  metaClicked,
  gridHotkeyPressed,
  getAllScreensRequested,
  zoomOutKeyPressed,
  zoomInKeyPressed,
  RedirectRequested
} from "../actions";
import {
  AppState,
  getActiveFrameIndex,
  getNodeInfoAtPoint,
  getSelectedFrames,
  isExpanded
} from "../state";
import { getVirtTarget } from "paperclip-utils";
import { handleCanvas } from "./canvas";
import { PCMutationActionKind } from "paperclip-source-writer/lib/mutations";
import history from "../dom-history";
import { utimes } from "fs";

export type AppStateSelector = (state) => AppState;

export default function* mainSaga(
  mount: HTMLElement,
  getState: AppStateSelector
) {
  yield fork(handleRenderer, getState);
  yield takeEvery(ActionType.CANVAS_MOUSE_UP, function*(action: CanvasMouseUp) {
    yield call(handleCanvasMouseUp, action, getState);
  });

  // wait for client to be loaded to initialize anything so that
  // events properly get sent (like LOCATION_CHANGED)
  yield take(ActionType.CLIENT_CONNECTED);
  yield fork(handleKeyCommands, mount);
  yield fork(handleDocumentEvents);
  yield fork(handleCanvas, getState);
  yield fork(handleClipboard, getState);
  yield fork(handleLocationChanged);
  yield fork(handleLocation, getState);
}

function handleSock(onMessage, onClient) {
  if (!/^http/.test(location.protocol)) {
    return;
  }
  const client = new SockJSClient(
    location.protocol + "//" + location.host + "/rt"
  );

  client.onopen = () => {
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

function* handleRenderer(getState: AppStateSelector) {
  let _client: any;

  const chan = eventChannel(emit => {
    handleSock(emit, client => {
      _client = client;
      emit(clientConnected(null));
    });

    //eslint-disable-next-line
    return () => {};
  });

  yield fork(function*() {
    while (1) {
      const action = yield take(chan);
      yield put(action);
    }
  });
  yield takeEvery(["FOCUS"], function() {
    window.focus();
  });

  yield takeEvery(
    [
      ActionType.LOCATION_CHANGED,
      ActionType.CLIENT_CONNECTED,
      ActionType.FS_ITEM_CLICKED
    ],
    function*() {
      const state: AppState = yield select(getState);
      yield put(fileOpened({ uri: state.ui.query.currentFileUri }));
    }
  );

  yield takeEvery(
    [
      ActionType.RESIZER_STOPPED_MOVING,
      ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING,
      ActionType.FRAME_TITLE_CHANGED,
      ActionType.GLOBAL_H_KEY_DOWN
    ],
    function*() {
      const state: AppState = yield select(getState);
      yield put(
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
    const state: AppState = yield select(getState);

    if (state.readonly) {
      return;
    }

    yield put(
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
    [ActionType.GRID_HOTKEY_PRESSED, ActionType.GRID_BUTTON_CLICKED],
    function*() {
      const state: AppState = yield select(getState);
      if (state.showBirdseye && !state.loadedBirdseyeInitially) {
        yield put(getAllScreensRequested(null));
      }
    }
  );

  yield takeEvery([ActionType.LOCATION_CHANGED], function*() {
    const state: AppState = yield select(getState);
    if (
      (!state.ui.query.currentFileUri ||
        location.pathname.indexOf("/all") === 0) &&
      !state.loadedBirdseyeInitially
    ) {
      yield put(getAllScreensRequested(null));
    }
  });

  yield takeEvery(
    [
      ActionType.META_CLICKED,
      ActionType.GLOBAL_Z_KEY_DOWN,
      ActionType.GLOBAL_Y_KEY_DOWN,
      ActionType.GLOBAL_SAVE_KEY_DOWN,
      ActionType.GET_ALL_SCREENS_REQUESTED,
      ActionType.PASTED,
      ActionType.FS_ITEM_CLICKED,
      ActionType.TITLE_DOUBLE_CLICKED,
      ActionType.ENV_OPTION_CLICKED,
      ActionType.ERROR_BANNER_CLICKED,
      ActionType.LOCATION_CHANGED,
      ActionType.POPOUT_WINDOW_REQUESTED,
      ActionType.PC_VIRT_OBJECT_EDITED,
      ActionType.FILE_OPENED
    ],
    function(action: Action) {
      _client && _client.send(action);
    }
  );
}

function* handleCanvasMouseUp(
  action: CanvasMouseUp,
  getState: AppStateSelector
) {
  if (!action.payload.metaKey) {
    return;
  }

  const state: AppState = yield select(getState);

  const nodeInfo = getNodeInfoAtPoint(
    state.canvas.mousePosition,
    state.canvas.transform,
    state.boxes,
    isExpanded(state) ? getActiveFrameIndex(state) : null
  );

  // maybe offscreen
  if (!nodeInfo) {
    return;
  }

  const nodePathParts = nodeInfo.nodePath.split(".").map(Number);

  const virtualNode = getVirtTarget(
    state.allLoadedPCFileData[state.ui.query.currentFileUri].preview,
    nodePathParts
  );

  yield put(metaClicked({ source: virtualNode.source }));
}

function* handleKeyCommands(mount: HTMLElement) {
  const chan = eventChannel(emit => {
    const handler = new Mousetrap(mount);
    handler.bind("esc", e => {
      if (isInput(e.target)) {
        return;
      }
      emit(globalEscapeKeyPressed(null));
      return false;
    });
    handler.bind("meta", () => {
      emit(globalMetaKeyDown(null));
    });
    handler.bind("meta+z", () => {
      emit(globalZKeyDown(null));
      return false;
    });
    handler.bind("meta+y", () => {
      emit(globalYKeyDown(null));
      return false;
    });
    handler.bind("meta+h", () => {
      emit(globalHKeyDown(null));
      return false;
    });
    handler.bind("meta+g", () => {
      emit(gridHotkeyPressed(null));
      return false;
    });
    handler.bind("meta+=", () => {
      emit(zoomInKeyPressed(null));
      return false;
    });
    handler.bind("meta+-", () => {
      emit(zoomOutKeyPressed(null));
      return false;
    });
    handler.bind("meta+s", () => {
      emit(globalSaveKeyPress(null));
      return false;
    });
    handler.bind("meta+shift+z", () => {
      emit(globalYKeyDown(null));
      return false;
    });
    handler.bind("backspace", e => {
      if (isInput(e.target)) {
        return;
      }
      emit(globalBackspaceKeyPressed(null));
      return false;
    });
    handler.bind(
      "meta",
      () => {
        emit(globalMetaKeyUp(null));
      },
      "keyup"
    );

    // https://github.com/ccampbell/mousetrap/pull/215
    addKeycodes({ 173: "-" });

    // eslint-disable-next-line
    return () => {};
  });

  while (1) {
    yield put(yield take(chan));
  }
}

const isInput = (node: HTMLElement) =>
  /textarea|input/.test(node.tagName.toLowerCase());

function* handleClipboard(getState: AppStateSelector) {
  yield fork(handleCopy, getState);
  yield fork(handlePaste, getState);
}
function* handleCopy(getState: AppStateSelector) {
  const ev = eventChannel(emit => {
    window.document.addEventListener("copy", emit);
    return () => {
      window.document.removeEventListener("copy", emit);
    };
  });

  yield takeEvery(ev, function*(event: ClipboardEvent) {
    const state: AppState = yield select(getState);
    const frames = getSelectedFrames(state);

    if (!frames.length) {
      return;
    }

    const buffer = ["\n"];

    for (const frame of frames) {
      if (!state.documentContents[frame.source.uri]) {
        console.warn(`document content doesn't exist`);
        return;
      }

      const start =
        frame.annotations?.source.location.start || frame.source.location.start;
      const end = frame.source.location.end;

      buffer.push(
        state.documentContents[frame.source.uri].slice(start, end),
        "\n"
      );
    }

    event.clipboardData.setData("text/plain", buffer.join("\n"));
    event.preventDefault();
  });
}

function* handlePaste(getState: AppStateSelector) {
  const ev = eventChannel(emit => {
    window.document.addEventListener("paste", emit);
    return () => {
      window.document.removeEventListener("paste", emit);
    };
  });

  yield takeEvery(ev, function*(event: ClipboardEvent) {
    const state: AppState = yield select(getState);
    if (state.readonly) {
      return;
    }
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

function* handleDocumentEvents() {
  yield fork(function*() {
    const chan = eventChannel(emit => {
      document.addEventListener("wheel", emit, { passive: false });
      document.addEventListener("keydown", emit);
      return () => {
        document.removeEventListener("wheel", emit);
        document.removeEventListener("keydown", emit);
      };
    });

    yield takeEvery(chan, (event: any) => {
      if (event.type === "wheel" && event.metaKey) {
        event.preventDefault();
      }

      if (
        event.type === "keydown" &&
        (event.key === "=" || event.key === "-") &&
        event.metaKey
      ) {
        // event.preventDefault();
      }
    });
  });
}

function* handleLocationChanged() {
  const parts = Url.parse(location.href, true);
  yield put(
    locationChanged({
      protocol: parts.protocol,
      host: parts.host,
      pathname: parts.pathname,
      query: parts.query
    })
  );
}

function* handleLocation(getState: AppStateSelector) {
  const chan = eventChannel(emit => {
    return history.listen(emit);
  });

  yield takeEvery(chan, handleLocationChanged);
  yield takeEvery(ActionType.REDIRECT_REQUESTED, function*(
    action: RedirectRequested
  ) {
    const state = yield select(getState);
    if (!state.syncLocationWithUI) {
      return;
    }
    history.push(state.ui.pathname + "?" + qs.stringify(state.ui.query));
  });
}
