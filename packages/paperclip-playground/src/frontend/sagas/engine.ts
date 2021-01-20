import { eventChannel } from "redux-saga";
import { fork, put, select, take, takeEvery } from "redux-saga/effects";
import { AppState } from "../state";
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
} from "../actions";
import {
  clientConnected,
  engineDelegateChanged,
  engineDelegateEventsHandled,
  ActionType as VEActionType,
} from "paperclip-visual-editor/src/actions";

export function* handleEngine() {
  yield fork(startEngine);
  yield put(clientConnected(null));
}

function* startEngine() {
  const worker = new Worker(new URL("./engine-worker.ts", import.meta.url));
  let _state: AppState = yield select();
  const incomming = eventChannel((emit) => {
    worker.onmessage = ({ data: action }: MessageEvent) => {
      emit(action);
    };
    worker.postMessage(workerInitialized({ appState: _state }));
    return () => {};
  });

  yield takeEvery(incomming, function* (action: Action) {
    yield put(action);
  });

  // Sync app state with worker
  yield takeEvery(
    [
      ActionType.CODE_EDITOR_TEXT_CHANGED,
      VEActionType.REDIRECT_REQUESTED,
      VEActionType.PC_VIRT_OBJECT_EDITED,
      ActionType.CONTENT_CHANGES_CREATED,
      ActionType.GET_PROJECT_FILES_REQUEST_CHANGED,
    ],
    function* (action) {
      const newState: AppState = yield select();
      const ops = compare(_state, newState);
      _state = newState;

      if (ops.length) {
        worker.postMessage(appStateDiffed({ ops }));
      }

      worker.postMessage(action);
    }
  );
}
