import { handleEngine } from "./engine";
import { fork, put, select, takeEvery } from "redux-saga/effects";
import veSaga from "paperclip-designer/src/sagas";
import { ActionType, NewFileNameEntered } from "../actions";
import { redirectRequest } from "paperclip-designer/src/actions";
import { getNewFilePath } from "../state";
import { AppState } from "../state";
import { handleAPI } from "./api";
import { handleLocation } from "./location";

export function* init(mount: HTMLDivElement) {
  yield fork(handleEngine);
  yield fork(veSaga, mount, (state: AppState) => state);
  yield fork(handleApp);
  yield fork(handleAPI);
  yield fork(handleLocation);
}

function* handleApp() {
  yield fork(handleNewFile);
}

function* handleNewFile() {
  yield takeEvery(ActionType.NEW_FILE_NAME_ENTERED, function*(
    action: NewFileNameEntered
  ) {
    yield put(
      redirectRequest({
        query: {
          currentFileUri: getNewFilePath(action.payload.value)
        }
      })
    );
  });
  yield takeEvery(ActionType.SYNC_PANELS_CLICKED, function*() {
    const state: AppState = yield select();
    yield put(
      redirectRequest({
        query: {
          currentFileUri: state.currentCodeFileUri
        }
      })
    );
  });
}
