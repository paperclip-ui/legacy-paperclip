import { AppState } from "../state";
import { call, fork, put, select, takeEvery } from "redux-saga/effects";
import {
  AccountConnected,
  ActionType,
  loggedOut,
  savedProject,
  sessionLoaded,
} from "../actions";
import * as api from "../api";

export function* handleAPI() {
  yield fork(handleAccountConnected);
  yield fork(handleSession);
  yield fork(handleProjectChanges);
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

function* handleProjectChanges() {
  // user logged in after editing content
  // yield takeEvery(ActionType.SESSION_LOADED, function*() {
  //   const state: AppState = yield select();
  //   if (state.hasUnsavedChanges) {

  //   }
  // })

  yield takeEvery(ActionType.SAVE_BUTTON_CLICKED, function* () {
    const state: AppState = yield select();

    if (!state.project) {
      yield call(api.createProject, undefined, state.documentContents);
    } else {
    }

    yield put(savedProject({ data: true, done: true }));
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
