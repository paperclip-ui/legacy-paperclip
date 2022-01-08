import { eventChannel } from "redux-saga";
import { fork, put, select, take, takeEvery } from "redux-saga/effects";
import { AppState, WorkerState, getWorkerState } from "../state";
import { compare } from "fast-json-patch";
import {
  Action,
  ActionType,
  workerInitialized,
  appStateDiffed
} from "../actions";

import {
  clientConnected,
  ActionType as VEActionType
} from "@tandem-ui/designer/src/actions";

export function* handleEngine() {
  yield fork(startEngine);
  yield put(clientConnected(null));
}

function* startEngine() {
  const worker = new Worker(new URL("./engine-worker.ts", import.meta.url));
  const channel = new BroadcastChannel("paperclip");

  let _state: WorkerState = getWorkerState(yield select());
  const incomming = eventChannel(emit => {
    channel.onmessage = ({ data: action }: MessageEvent) => {
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
