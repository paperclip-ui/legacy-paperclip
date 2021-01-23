import { eventChannel } from "redux-saga";
import { call, cancel, cancelled, fork, put, select, take, takeEvery } from "redux-saga/effects";
import { AppState, WorkerState, getWorkerState } from "../state";
import { EngineDelegate } from "paperclip";
import * as path from "path";
import { compare, applyPatch } from "fast-json-patch";
import {
  engineCrashed,
  engineLoaded,
  Action,
  ActionType,
  CodeEditorTextChanged,
  workerInitialized,
  appStateDiffed,
  GetProjectFilesRequestChanged
} from "../actions";

import {
  clientConnected,
  engineDelegateChanged,
  engineDelegateEventsHandled,
  ActionType as VEActionType
} from "paperclip-designer/src/actions";

export function* handleEngine() {
  yield fork(startEngine);
  yield put(clientConnected(null));
}

function* startEngine() {
    const worker = new Worker(new URL("./engine-worker.ts", import.meta.url));

    let _state: WorkerState = getWorkerState(yield select());
    const incomming = eventChannel(emit => {
      worker.onmessage = ({ data: action }: MessageEvent) => {
        emit(action);
      };
      worker.postMessage(workerInitialized({ state: _state }));
      return () => {
        worker.onmessage = undefined;
        worker.terminate();
      };
    });

    yield takeEvery(incomming, function*(action: Action) {
      yield put(action);
    });

    // Sync app state with worker
    yield takeEvery(
      [
        ActionType.SLIM_CODE_EDITOR_TEXT_CHANGED,
        ActionType.CODE_EDITOR_TEXT_CHANGED,
        ActionType.GET_PROJECT_FILES_REQUEST_CHANGED,
        VEActionType.REDIRECT_REQUESTED,
        VEActionType.PC_VIRT_OBJECT_EDITED,
        ActionType.CONTENT_CHANGES_CREATED,
        VEActionType.GLOBAL_Z_KEY_DOWN,
        VEActionType.GLOBAL_Y_KEY_DOWN
      ],
      function*(action) {
        const newState: AppState = yield select();
        const workerState: WorkerState = getWorkerState(newState);
        const ops = compare(_state, workerState);
        _state = workerState;

        if (ops.length) {
          worker.postMessage(appStateDiffed({ ops }));
        }

        worker.postMessage(action);
      }
    );

}
