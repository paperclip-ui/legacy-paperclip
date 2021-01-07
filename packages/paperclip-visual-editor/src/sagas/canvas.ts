import { fork, put, select, takeEvery } from "redux-saga/effects";
import { ActionType, popoutWindowRequested } from "../actions";
import { AppState } from "../state";

export function* handleCanvas() {
  yield fork(handleDND);
  yield fork(handleToolbar);
}

function* handleDND() {
  yield takeEvery(
    [
      ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING,
      ActionType.RESIZER_STOPPED_MOVING
    ],
    function*() {}
  );
}

function* handleToolbar() {
  yield takeEvery(ActionType.POPOUT_BUTTON_CLICKED, function*() {
    const state: AppState = yield select();
    yield put(popoutWindowRequested({ uri: state.currentFileUri }));
  });
}
