import { fork } from "redux-saga/effects";

export default function* mainSaga() {
  yield fork(handleVSCodeEvents);
}

function* handleVSCodeEvents() {
  console.log("handle");
}
