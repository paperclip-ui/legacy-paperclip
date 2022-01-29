import {
  fork,
  take,
  put,
  takeLatest,
  call,
  select,
  cancel,
  takeEvery,
  throttle,
  delay,
} from "redux-saga/effects";
import { eventChannel } from "redux-saga";

import { Channel } from "@paperclip-ui/common";
import {
  fileLoaded,
  StyleRuleFileNameClicked,
  SyncPanelsClicked,
  dirLoaded,
  sourcesEdited,
  allPCContentLoaded,
  globalBackspaceKeySent,
  FileItemClicked,
  mainActions,
  fileOpened,
  FSItemClicked,
  CanvasMouseDown,
  LayerLeafClicked,
  NodeBreadcrumbClicked,
  redirectRequest,
  CodeChanged,
  ActionType,
  commitRequestStateChanged,
  BranchChanged,
  setBranchRequestStateChanged,
  ServerOptionsLoaded,
  Action,
  CommitMessageEntered,
  virtualNodeSourcesLoaded,
  virtualNodeStylesInspected,
} from "../../actions";
import {
  commitChangesChannel,
  setBranchChannel,
  editCodeChannel,
  editPCSourceChannel,
  eventsChannel,
  getAllScreensChannel,
  helloChannel,
  loadDirectoryChannel,
  loadVirtualNodeSourcesChannel,
  openFileChannel,
  popoutWindowChannel,
  revealNodeSourceByIdChannel,
  revealNodeSourceChannel,
} from "../../rpc/channels";
import {
  AppState,
  flattenFrameBoxes,
  FSItemKind,
  getActiveFrameIndex,
  getActivePCData,
  getFrameFromIndex,
  getNodeInfoAtPoint,
  getScopedBoxes,
  isExpanded,
} from "../../state";

import {
  computeVirtScriptObject,
  nodePathToAry,
  VirtNodeSource,
} from "@paperclip-ui/utils";
import { PCMutation, PCMutationActionKind } from "@paperclip-ui/source-writer";
import path from "path";
import { IConnection, SockConnection } from "./connection";
import { request, takeState } from "../utils";

export type HandleRPCOptions = {
  createConnection?: () => IConnection;
};

const createDefaultConnection = () => new SockConnection();

export function* handleRPC({
  createConnection = createDefaultConnection,
}: HandleRPCOptions) {
  let _client: IConnection = createConnection();
  yield fork(handleProject, _client);
  yield fork(handleCanvasRedirect);
}

function* handleProject(client: IConnection) {
  // yield fork(handleProjectDirectory, loadDirectory);
  // yield fork(handleEngineEvents, events);
  // yield fork(handleClientComunication, client);
  // yield takeEvery(
  //   ActionType.COMMIT_MESSAGE_ENTERED,
  //   function* (event: CommitMessageEntered) {
  //     yield call(handleCommitMessageEntered, event, commitChanges);
  //   }
  // );
  // yield takeEvery(ActionType.BRANCH_CHANGED, function* (event: BranchChanged) {
  //   yield call(handleBranchChanged, event, setBranch);
  // });
}

function* handleEngineEvents(events: ReturnType<typeof eventsChannel>) {
  const chan = eventChannel((emit) => {
    events.listen(async (ev) => {
      emit(ev);
    });
    return () => {};
  });

  yield takeEvery(chan, function* (ev) {
    yield put(ev as Action);
  });
}

function* handleCommitMessageEntered(
  { payload: { message: description } }: CommitMessageEntered,
  commitChanges: ReturnType<typeof commitChangesChannel>
) {
  yield request(commitRequestStateChanged, function* () {
    return yield call(commitChanges.call, { description });
  });
}

function* handleBranchChanged(
  { payload: { branchName } }: BranchChanged,
  setBranch: ReturnType<typeof setBranchChannel>
) {
  yield request(setBranchRequestStateChanged, function* () {
    return yield call(setBranch.call, { branchName });
  });
}

function* handleProjectDirectory(
  loadRemoteDirectory: ReturnType<typeof loadDirectoryChannel>
) {
  // TODO - needs to be take state instead
  yield takeLatest(
    ActionType.SERVER_OPTIONS_LOADED,
    function* ({
      payload: { localResourceRoots, canvasFile },
    }: ServerOptionsLoaded) {
      yield call(
        loadProjectDirectory,
        loadRemoteDirectory,
        localResourceRoots[0],
        true
      );
    }
  );
}

function* loadProjectDirectory(
  loadRemoteDirectory: ReturnType<typeof loadDirectoryChannel>,
  path: string,
  root = false
) {
  const dir = yield call(loadRemoteDirectory.call, { path });
  yield put(dirLoaded({ item: dir, isRoot: root }));
}

function* handleClientComunication(client) {
  const revealNodeSource = revealNodeSourceChannel(client);
  const popoutWindow = popoutWindowChannel(client);
  const getAllScreens = getAllScreensChannel(client);
  const loadRemoteDirectory = loadDirectoryChannel(client);
  const openFile = openFileChannel(client);
  const loadVirtualNodeSources = loadVirtualNodeSourcesChannel(client);
  const revealNodeSourceById = revealNodeSourceByIdChannel(client);
  const editPCSource = editPCSourceChannel(client);
  const editCode = editCodeChannel(client);

  yield takeEvery(ActionType.CODE_CHANGED, handleCodeChanged(editCode));

  yield takeEvery(
    [ActionType.FS_ITEM_CLICKED],
    function* (action: FSItemClicked) {
      if (action.payload.kind == FSItemKind.DIRECTORY) {
        yield call(
          loadProjectDirectory,
          loadRemoteDirectory,
          action.payload.absolutePath
        );
      }
      if (action.payload.kind === FSItemKind.FILE) {
        yield put(
          redirectRequest({ query: { canvasFile: action.payload.url } })
        );
      }
    }
  );

  yield takeEvery(
    [ActionType.SYNC_PANELS_CLICKED],
    function* (action: SyncPanelsClicked) {
      const state: AppState = yield select();
      yield put(
        redirectRequest({
          query: { canvasFile: state.designer.currentCodeFile },
        })
      );
    }
  );

  yield takeEvery(
    [ActionType.GRID_HOTKEY_PRESSED, ActionType.GRID_BUTTON_CLICKED],
    function* () {
      const state: AppState = yield select();
      if (
        state.designer.showBirdseye &&
        !state.designer.loadedBirdseyeInitially
      ) {
        yield call(reloadScreens);
      }
    }
  );

  yield takeEvery([mainActions.locationChanged.type], maybeLoadScreens);

  function* maybeLoadScreens() {
    const state: AppState = yield select();
    if (
      (!state.designer.ui.query.canvasFile ||
        state.designer.ui.query.showAll ||
        location.pathname.indexOf("/all") === 0) &&
      !state.designer.loadedBirdseyeInitially
    ) {
      yield call(reloadScreens);
    }
  }

  yield takeEvery([ActionType.SERVER_OPTIONS_LOADED], maybeLoadScreens);

  function* reloadScreens() {
    const screens = yield call(getAllScreens.call);
    yield put(allPCContentLoaded(screens));
  }

  let _previousFileUri;

  yield takeEvery(
    [ActionType.FILE_ITEM_CLICKED],
    function* (action: FileItemClicked) {
      yield call(loadFile, action.payload.uri);
    }
  );

  function* loadFile(uri: string) {
    try {
      const result = yield call(openFile.call, { uri });
      if (result) {
        yield put(fileLoaded(result));
      }
    } catch (e) {
      console.error(e);
    }
  }

  // yield takeEvery(
  //   [
  //     ActionType.RESIZER_STOPPED_MOVING,
  //     ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING,
  //     ActionType.FRAME_TITLE_CHANGED,
  //     ActionType.GLOBAL_H_KEY_DOWN,
  //   ],
  //   function* () {
  //     const state: AppState = yield select();

  //     yield call(
  //       editPCSource2,
  //       state.designer.selectedNodePaths
  //         .map((info, i) => {
  //           const frame = getFrameFromIndex(Number(info), state.designer);
  //           if (!frame) {
  //             return null;
  //           }
  //           return {
  //             // may not exist if source is not returned in time for this edit
  //             targetId: state.designer.selectedNodeSources[i]?.source.sourceId,
  //             action: {
  //               kind: PCMutationActionKind.ANNOTATIONS_CHANGED,
  //               annotations: computeVirtScriptObject(frame.annotations),
  //             },
  //           };
  //         })
  //         .filter((v) => v?.targetId) as PCMutation[]
  //     );
  //   }
  // );

  function* editPCSource2(mutations: PCMutation[]) {
    const changes = yield call(editPCSource.call, mutations);
    yield put(sourcesEdited(changes));
  }

  yield takeEvery([ActionType.GLOBAL_BACKSPACE_KEY_PRESSED], function* () {
    const state: AppState = yield select();

    if (state.designer.selectedNodePaths.length) {
      yield call(
        editPCSource2,
        state.designer.selectedNodePaths
          .map((v, index) => {
            // may not exist if source is not returned in time for this edit
            return {
              targetId:
                state.designer.selectedNodeSources[index]?.source.sourceId,
              action: {
                kind: PCMutationActionKind.EXPRESSION_DELETED,
              },
            };
          })
          .filter((v) => v.targetId) as PCMutation[]
      );
    }

    yield put(globalBackspaceKeySent(null));
  });
}

const handleCodeChanged = (
  editCode: Channel<{ uri: string; value: string }, void>
) =>
  function* ({ payload: { value } }: CodeChanged) {
    const state: AppState = yield select();
    yield call(editCode.call, {
      uri: state.designer.currentCodeFile,
      value,
    });
  };

function* handleCanvasRedirect() {
  yield takeLatest(
    ActionType.SERVER_OPTIONS_LOADED,
    function* ({ payload: { canvasFile } }: ServerOptionsLoaded) {
      const state: AppState = yield select();
      if (!state.designer.ui.query.canvasFile && canvasFile) {
        yield put(redirectRequest({ query: { canvasFile } }));
      }
    }
  );
}
