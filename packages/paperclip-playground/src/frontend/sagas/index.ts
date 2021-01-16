import { handleEngine } from "./engine";
import { fork } from "redux-saga/effects";
import veSaga from "paperclip-visual-editor/src/sagas";

export function* init() {
  yield fork(handleEngine);
  yield fork(veSaga);
}
