import { handleEngine } from "./engine";
import { fork, put, takeEvery } from "redux-saga/effects";
import veSaga from "paperclip-visual-editor/src/sagas";
import { ActionType, NewFileNameEntered } from "../actions";
import { redirectRequest } from "paperclip-visual-editor/src/actions";
import { getNewFilePath } from "../state";

export function* init() {
  yield fork(handleEngine);
  yield fork(veSaga);
}
