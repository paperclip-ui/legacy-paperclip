import { handleEngine } from "./engine";
import { fork, put, select, takeEvery } from "redux-saga/effects";
import veSaga from "paperclip-visual-editor/src/sagas";
import { ActionType, NewFileNameEntered } from "../actions";
import { redirectRequest } from "paperclip-visual-editor/src/actions";
import { getNewFilePath } from "../state";
import { AppState } from "../state";
import { handleAPI } from "./api";

export function* init(mount: HTMLDivElement) {
  yield fork(handleEngine);
  yield fork(veSaga, mount);
  yield fork(handleApp);
  yield fork(handleAPI);
}

function* handleApp() {
  yield fork(handleNewFile);
}

function* handleNewFile() {
  yield takeEvery(ActionType.NEW_FILE_NAME_ENTERED, function* (
    action: NewFileNameEntered
  ) {
    yield put(
      redirectRequest({
        query: {
          currentFileUri: getNewFilePath(action.payload.value),
        },
      })
    );
  });
  yield takeEvery(ActionType.SYNC_PANELS_CLICKED, function* () {
    const state: AppState = yield select();
    yield put(
      redirectRequest({
        query: {
          currentFileUri: state.currentCodeFileUri,
        },
      })
    );
  });
}
