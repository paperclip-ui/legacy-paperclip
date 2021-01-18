import { call, fork, put, takeEvery } from "redux-saga/effects";
import { AccountConnected, ActionType, sessionLoaded } from "../actions";
import * as api from "../api";

export function* handleAPI() {
  yield fork(handleAccountConnected);
  yield fork(handleSession);
}

function* handleAccountConnected() {
  yield takeEvery(ActionType.ACCOUNT_CONNECTED, function* ({
    payload: { kind, details },
  }: AccountConnected) {
    const user = yield call(api.connectAccount, kind, details);
    yield put(sessionLoaded(user));
  });
}

function* handleSession() {
  yield fork(loadSession);
}

function* loadSession() {
  try {
    yield put(sessionLoaded(yield call(api.getUser)));
  } catch (e) {}
}
