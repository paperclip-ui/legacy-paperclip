import { call, fork, put, takeEvery } from "redux-saga/effects";
import {
  AccountConnected,
  ActionType,
  loggedOut,
  sessionLoaded,
} from "../actions";
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
  yield takeEvery(ActionType.LOGOUT_BUTTON_CLICKED, function* () {
    yield call(api.logout);
    yield put(loggedOut(null));
  });
}

function* loadSession() {
  try {
    const user = yield call(api.getUser);
    if (user) {
      yield put(sessionLoaded(user));
    }
  } catch (e) {}
}
