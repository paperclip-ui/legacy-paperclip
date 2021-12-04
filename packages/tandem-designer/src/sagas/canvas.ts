import { fork, put, select, takeEvery } from "redux-saga/effects";
import { AppStateSelector } from ".";
import { ActionType, popoutWindowRequested } from "../actions";
import { AppState } from "../state";

export function* handleCanvas(getState: AppStateSelector) {
  yield fork(handleToolbar, getState);
}

function* handleToolbar(getState: AppStateSelector) {
  yield takeEvery(ActionType.POPOUT_BUTTON_CLICKED, function* () {
    const state: AppState = yield select(getState);
    yield put(
      popoutWindowRequested({ uri: state.designer.ui.query.canvasFile })
    );
  });
}
