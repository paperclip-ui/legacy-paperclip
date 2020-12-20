import { fork, takeEvery } from "redux-saga/effects";
import { ActionType } from "../actions";

export function* handleCanvas() {
  yield fork(handleDND);
}

function* handleDND() {
  yield takeEvery(
    [
      ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING,
      ActionType.RESIZER_STOPPED_MOVING
    ],
    function*() {
      console.log("DONE");
    }
  );
}
