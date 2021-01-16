import { handleEngine } from "./engine";
import { fork } from "redux-saga/effects";

export function* init() {
  yield fork(handleEngine);
}
