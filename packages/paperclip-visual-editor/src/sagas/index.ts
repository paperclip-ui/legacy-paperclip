import { fork, put, take } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import {
  engineErrorReceived,
  initReceived,
  engineEventReceived
} from "../actions";

declare const vscode;

export default function* mainSaga() {
  yield fork(handleVSCodeEvents);
}

function* handleVSCodeEvents() {
  const parent = typeof vscode != "undefined" ? vscode : window;

  const chan = eventChannel((emit: any) => {
    const onMessage = ({ data: { type, payload } }: MessageEvent) => {
      if (type === "ENGINE_EVENT") {
        emit(engineEventReceived(JSON.parse(payload)));
      } else if (type === "INIT") {
        emit(initReceived(JSON.parse(payload)));
      } else if (type === "ERROR") {
        emit(engineErrorReceived(JSON.parse(payload)));
      }
    };
    window.onmessage = onMessage;

    return () => {
      window.onmessage = undefined;
    };
  });

  while (1) {
    const action = yield take(chan);
    yield put(action);
  }

  parent.postMessage({
    type: "ready"
  });
}
