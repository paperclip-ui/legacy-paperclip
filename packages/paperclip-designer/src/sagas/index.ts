import Mousetrap, { addKeycodes } from "mousetrap";
import SockJSClient from "sockjs-client";
import {
  computeVirtJSObject,
  LoadedPCData,
  VirtNodeSource,
  nodePathToAry
} from "paperclip-utils";
import * as Url from "url";
import {
  fork,
  put,
  take,
  takeEvery,
  select,
  call,
  takeLatest,
  throttle
} from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import * as qs from "querystring";
import {
  ActionType,
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
  globalOptionKeyDown,
  globalOptionKeyUp,
  actionHandled,
  redirectRequest,
  virtualNodeStylesInspected,
  NodeBreadcrumbClicked,
  LayerLeafClicked,
  allPCContentLoaded,
  serverOptionsLoaded,
  ServerOptionsLoaded,
  dirLoaded,
  pcFileLoaded,
  virtualNodeSourcesLoaded,
  StyleRuleFileNameClicked,
  windowFocused,
  windowBlurred
} from "../actions";
import {
  AppState,
  DesignerState,
  getActiveFrameIndex,
  getActivePCData,
  getFrameFromIndex,
  getNodeInfoAtPoint,
  getScopedBoxes,
  getSelectedFrames,
  isExpanded,
  SyncLocationMode
} from "../state";
import { getVirtTarget } from "paperclip-utils";
import { handleCanvas } from "./canvas";
import {
  PCMutation,
  PCMutationActionKind
} from "paperclip-source-writer/lib/mutations";
import history from "../dom-history";
import { omit } from "lodash";
import {
  getAllScreensChannel,
  inspectNodeStyleChannel,
  popoutWindowChannel,
  revealNodeSourceChannel,
  getServerOptionsChannel,
  loadDirectoryChannel,
  openFileChannel,
  loadVirtualNodeSourcesChannel,
  revealNodeSourceByIdChannel,
  editPCSourceChannel,
  eventsChannel
} from "../rpc/channels";
import { sockAdapter } from "../../../paperclip-common";

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
  // yield fork(handleClipboard, getState);
  yield fork(handleLocationChanged);
  yield fork(handleLocation, getState);
  yield fork(handleActions, getState);
  yield fork(handleVirtualObjectSelected, getState);
  yield fork(handleAppFocus);
}

function handleSock(onMessage, onClient) {
  if (!/^http/.test(location.protocol)) {
    return;
  }
  const client = new SockJSClient(
    location.protocol + "//" + location.host + "/rt"
  );

  client.onopen = () => {
    onClient(sockAdapter(client));
  };

  client.onmessage = message => {
    const ev = JSON.parse(message.data);
    onMessage(ev);
  };

  return () => {
    client.close();
  };
}

function* handleClientComunication(client, getState, projectDirectory: string) {
  const inspectNodeStyle = inspectNodeStyleChannel(client);
  const revealNodeSource = revealNodeSourceChannel(client);
  const popoutWindow = popoutWindowChannel(client);
  const getAllScreens = getAllScreensChannel(client);
  const loadDirectory = loadDirectoryChannel(client);
  const openFile = openFileChannel(client);
  const loadVirtualNodeSources = loadVirtualNodeSourcesChannel(client);
  const revealNodeSourceById = revealNodeSourceByIdChannel(client);
  const editPCSource = editPCSourceChannel(client);
  const events = eventsChannel(client);

  yield fork(function*() {
    const chan = eventChannel(emit => {
      events.listen(async action => {
        emit(action);
      });
      return () => {};
    });
    yield takeEvery(chan, function*(action: Action) {
      if (action["remote"]) {
        return;
      }
      action["remote"] = true;
      yield put(action);
    });
    while (1) {
      const action = yield take();
      if (!action["public"] || action["remote"]) {
        continue;
      }
      events.call(action);
    }
  });

  yield call(loadDirectory2, projectDirectory, true);

  function* loadDirectory2(path: string, root: boolean) {
    const dir = yield call(loadDirectory.call, { path });
    yield put(dirLoaded({ item: dir, isRoot: root }));
  }

  yield takeEvery(
    [ActionType.GRID_HOTKEY_PRESSED, ActionType.GRID_BUTTON_CLICKED],
    function*() {
      const state: AppState = yield select(getState);
      if (
        state.designer.showBirdseye &&
        !state.designer.loadedBirdseyeInitially
      ) {
        yield call(reloadScreens);
      }
    }
  );

  yield takeEvery([ActionType.LOCATION_CHANGED], maybeLoadScreens);

  function* maybeLoadScreens() {
    const state: AppState = yield select(getState);
    if (
      (!state.designer.ui.query.canvasFile ||
        location.pathname.indexOf("/all") === 0) &&
      !state.designer.loadedBirdseyeInitially
    ) {
      yield call(reloadScreens);
    }
  }

  yield fork(maybeLoadScreens);

  function* reloadScreens() {
    const screens = yield call(getAllScreens.call);
    yield put(allPCContentLoaded(screens));
  }

  yield takeEvery(
    [ActionType.CANVAS_MOUSE_UP, ActionType.FRAME_TITLE_CLICKED],
    function*() {
      const state: AppState = yield select(getState);

      if (!state.designer.selectedNodePaths.length) {
        return;
      }
      const sources = yield call(
        loadVirtualNodeSources.call,
        state.designer.selectedNodePaths.map(nodePath => {
          return {
            path: nodePath.split(".").map(Number),
            uri: state.designer.ui.query.canvasFile!
          };
        })
      );

      yield put(virtualNodeSourcesLoaded(sources));
    }
  );

  yield throttle(500, [ActionType.LOCATION_CHANGED], function*() {});

  yield takeEvery(ActionType.STYLE_RULE_FILE_NAME_CLICKED, function*({
    payload: { styleRuleSourceId }
  }: StyleRuleFileNameClicked) {
    yield call(revealNodeSourceById.call, styleRuleSourceId);
  });

  yield throttle(
    500,
    [
      ActionType.NODE_BREADCRUMB_CLICKED,
      ActionType.CANVAS_MOUSE_UP,
      ActionType.FRAME_TITLE_CLICKED,
      ActionType.LAYER_LEAF_CLICKED,
      ActionType.ENGINE_DELEGATE_CHANGED,
      ActionType.FILE_OPENED
    ],
    function*() {
      const state: AppState = yield select();
      if (!state.designer.selectedNodePaths.length) {
        return;
      }

      const inspectionInfo = yield call(
        inspectNodeStyle.call,
        state.designer.selectedNodePaths.map(path => ({
          path: nodePathToAry(path),
          uri: state.designer.ui.query.canvasFile
        }))
      );

      yield put(virtualNodeStylesInspected(inspectionInfo));
    }
  );

  yield takeEvery(
    [ActionType.NODE_BREADCRUMB_CLICKED, ActionType.LAYER_LEAF_CLICKED],
    function*({
      payload: { metaKey, nodePath }
    }: NodeBreadcrumbClicked | LayerLeafClicked) {
      if (!metaKey) {
        return;
      }
      const state: AppState = yield select();
      yield call(revealNodeSource.call, {
        path: nodePathToAry(nodePath),
        uri: state.designer.ui.query.canvasFile
      } as VirtNodeSource);
    }
  );

  yield takeEvery([ActionType.CANVAS_MOUSE_UP], function*({
    payload: { metaKey }
  }: CanvasMouseUp) {
    if (!metaKey) {
      return;
    }

    const state: AppState = yield select(getState);

    const nodeInfo = getNodeInfoAtPoint(
      state.designer.canvas.mousePosition,
      state.designer.canvas.transform,
      getScopedBoxes(
        state.designer.boxes,
        state.designer.scopedElementPath,
        getActivePCData(state.designer).preview
      ),
      isExpanded(state.designer) ? getActiveFrameIndex(state.designer) : null
    );

    // maybe offscreen
    if (!nodeInfo) {
      return;
    }

    yield call(revealNodeSource.call, {
      path: nodePathToAry(nodeInfo.nodePath),
      uri: state.designer.ui.query.canvasFile
    } as VirtNodeSource);
  });

  yield takeEvery(ActionType.POPOUT_BUTTON_CLICKED, function*() {
    yield call(popoutWindow.call, {
      path: window.location.pathname + window.location.search
    });
  });

  let _previousFileUri;

  yield takeEvery(
    [
      ActionType.LOCATION_CHANGED,
      ActionType.CLIENT_CONNECTED,
      ActionType.FS_ITEM_CLICKED
    ],
    maybeLoadCanvasFile
  );

  function* maybeLoadCanvasFile() {
    const state: AppState = yield select(getState);
    const currUri = state.designer.ui.query.canvasFile;
    if (currUri !== _previousFileUri) {
      _previousFileUri = currUri;
      yield put(fileOpened({ uri: state.designer.ui.query.canvasFile }));
      const result = yield call(openFile.call, { uri: currUri });
      if (result) {
        yield put(pcFileLoaded(result));
      }
    }
  }

  yield takeEvery(
    [
      ActionType.RESIZER_STOPPED_MOVING,
      ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING,
      ActionType.FRAME_TITLE_CHANGED,
      ActionType.GLOBAL_H_KEY_DOWN
    ],
    function*() {
      const state: AppState = yield select(getState);

      yield call(
        editPCSource.call,
        state.designer.selectedNodePaths.map((info, i) => {
          const frame = getFrameFromIndex(Number(info), state.designer);
          return {
            targetId: state.designer.selectedNodeSources[i].source.sourceId,
            action: {
              kind: PCMutationActionKind.ANNOTATIONS_CHANGED,
              annotations: computeVirtJSObject(frame.annotations)
            }
          };
        }) as PCMutation[]
      );
    }
  );

  yield takeEvery([ActionType.GLOBAL_BACKSPACE_KEY_PRESSED], function*() {
    const state: AppState = yield select(getState);

    if (state.designer.selectedNodePaths.length) {
      yield call(
        editPCSource.call,
        state.designer.selectedNodePaths.map((v, index) => {
          return {
            targetId: state.designer.selectedNodeSources[index].source.sourceId,
            action: {
              kind: PCMutationActionKind.EXPRESSION_DELETED
            }
          };
        }) as PCMutation[]
      );
    }

    yield put(globalBackspaceKeySent(null));
  });

  yield call(maybeLoadCanvasFile);
}

function* handleClientChans(client: any, getState: any) {
  const getServerOptions = getServerOptionsChannel(client);

  function* loadServerOptions() {
    const options = yield call(getServerOptions.call);
    yield put(serverOptionsLoaded(options));
  }

  yield takeLatest(ActionType.SERVER_OPTIONS_LOADED, function*({
    payload: { localResourceRoots }
  }: ServerOptionsLoaded) {
    yield fork(
      handleClientComunication,
      client,
      getState,
      localResourceRoots[0]
    );
  });

  yield call(loadServerOptions);
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

      // ensure it's an action
      if (action.type) {
        yield put(action);
      }
    }
  });

  yield takeLatest(ActionType.CLIENT_CONNECTED, function*() {
    yield call(handleClientChans, _client, getState);
  });

  yield takeEvery(["FOCUS"], function() {
    window.focus();
  });
}

function* handleCanvasMouseUp(
  action: CanvasMouseUp,
  getState: AppStateSelector
) {
  yield fork(handleSyncFrameToLocation);

  const state: AppState = yield select();
}

function* handleSyncFrameToLocation() {
  const state: AppState = yield select();

  function* removeFrameFromQuery() {
    if (!state.designer.ui.query.frame) {
      return;
    }

    yield put(
      redirectRequest({ query: omit(state.designer.ui.query, ["frame"]) })
    );
  }

  if (state.designer.selectedNodePaths.length !== 1) {
    return yield call(removeFrameFromQuery);
  }

  const nodePath = state.designer.selectedNodePaths[0].split(".");

  if (nodePath.length !== 1) {
    return yield call(removeFrameFromQuery);
  }

  yield put(
    redirectRequest({
      query: {
        ...state.designer.ui.query,
        frame: nodePath[0]
      }
    })
  );
}

function* handleKeyCommands(mount: HTMLElement) {
  const state: AppState = yield select();

  // if compact, then only capture events on mount, othwewise we'll expect
  // the designer to take the whole page.
  const keyBindingMount = state.compact ? mount : document;
  const embedded = state.designer.ui.query.embedded;
  const chan = eventChannel(emit => {
    const handler = new Mousetrap(keyBindingMount);
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
    handler.bind(
      "meta",
      () => {
        emit(globalMetaKeyUp(null));
      },
      "keyup"
    );
    handler.bind("option", () => {
      emit(globalOptionKeyDown(null));
    });
    handler.bind(
      "option",
      () => {
        emit(globalOptionKeyUp(null));
      },
      "keyup"
    );
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
    handler.bind("meta+s", e => {
      emit(globalSaveKeyPress(null));
      if (!embedded) {
        e.preventDefault();
      }
      return !embedded;
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

// function* handleClipboard(getState: AppStateSelector) {
//   yield fork(handleCopy, getState);
//   yield fork(handlePaste, getState);
// }
// function* handleCopy(getState: AppStateSelector) {
//   const ev = eventChannel(emit => {
//     window.document.addEventListener("copy", emit);
//     return () => {
//       window.document.removeEventListener("copy", emit);
//     };
//   });

//   yield takeEvery(ev, function*(event: ClipboardEvent) {
//     if (isInput(event.target as any)) {
//       return;
//     }

//     const state: AppState = yield select(getState);
//     const frames = getSelectedFrames(state.designer);

//     if (!frames.length) {
//       return;
//     }

//     const buffer = ["\n"];

//     for (const frame of frames) {
//       if (!state.shared.documents[frame.source.uri]) {
//         console.warn(`document content doesn't exist`);
//         return;
//       }

//       const start =
//         frame.annotations?.source.location.start || frame.source.location.start;
//       const end = frame.source.location.end;

//       buffer.push(
//         state.shared.documents[frame.source.uri].toString().slice(start, end),
//         "\n"
//       );
//     }

//     event.clipboardData.setData("text/plain", buffer.join("\n"));
//     event.preventDefault();
//   });
// }

// function* handlePaste(getState: AppStateSelector) {
//   const ev = eventChannel(emit => {
//     window.document.addEventListener("paste", emit);
//     return () => {
//       window.document.removeEventListener("paste", emit);
//     };
//   });

//   yield takeEvery(ev, function*(event: ClipboardEvent) {
//     const state: AppState = yield select(getState);
//     if (state.designer.readonly) {
//       return;
//     }
//     const content = event.clipboardData.getData("text/plain");
//     event.preventDefault();
//     if (content) {
//       yield put(
//         pasted({
//           clipboardData: [
//             {
//               type: "text/plain",
//               content
//             }
//           ]
//         })
//       );
//     }
//   });
// }

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
  yield takeEvery(ActionType.REDIRECT_REQUESTED, function*() {
    const state = yield select(getState);

    const pathname =
      state.designer.syncLocationMode & SyncLocationMode.Location
        ? state.designer.ui.pathname
        : history.location.pathname;
    const search =
      state.designer.syncLocationMode & SyncLocationMode.Query
        ? "?" + qs.stringify(state.designer.ui.query)
        : history.location.search;

    const newPath = pathname + search;

    if (newPath !== history.location.pathname + history.location.search) {
      history.push(newPath);
    }
  });
}

function* handleActions(getState: AppStateSelector) {
  while (1) {
    yield take();
    const state: AppState = yield select(getState);
    if (state.actions.length) {
      yield put(actionHandled(null));

      // need to clone to unfreeze
      yield put(JSON.parse(JSON.stringify(state.actions[0])));
    }
  }
}

function* handleVirtualObjectSelected(getState: AppStateSelector) {}

function* handleAppFocus() {
  const chan = eventChannel(emit => {
    document.addEventListener("mouseenter", ev => {
      if (ev.target === document) {
        emit(windowFocused(null));
      }
    });
    document.addEventListener("mouseleave", ev => {
      if (ev.target === document) {
        emit(windowBlurred(null));
      }
    });
    return () => {};
  });

  yield takeEvery(chan, function*(event: any) {
    yield put(event);
  });
}
