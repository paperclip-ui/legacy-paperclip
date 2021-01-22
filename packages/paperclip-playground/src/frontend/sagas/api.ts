import { AppState } from "../state";
import { call, fork, put, select, takeEvery } from "redux-saga/effects";
import history from "paperclip-designer/src/dom-history";
import {
  AccountConnected,
  ActionType,
  loggedOut,
  savedProject,
  sessionLoaded
} from "../actions";
import * as api from "../api";

export function* handleAPI() {
  yield fork(handleAccountConnected);
  yield fork(handleSession);
  yield fork(handleProjectChanges);
}

function* handleAccountConnected() {
  yield takeEvery(ActionType.ACCOUNT_CONNECTED, function*({
    payload: { kind, details }
  }: AccountConnected) {
    const user = yield call(api.connectAccount, kind, details);
    yield put(sessionLoaded(user));
  });
}

function* handleSession() {
  yield fork(loadSession);
  yield takeEvery(ActionType.LOGOUT_BUTTON_CLICKED, function*() {
    yield call(api.logout);
    yield put(loggedOut(null));
  });
}

function* handleProjectChanges() {
  let _lastSavedState: AppState;
  // user logged in after editing content
  // yield takeEvery(ActionType.SESSION_LOADED, function*() {
  //   const state: AppState = yield select();
  //   if (state.hasUnsavedChanges) {

  //   }
  // })

  function* createNewProject() {
    const state: AppState = yield select();
    const project = yield call(
      api.createProject,
      undefined,
      state.shared.documents,
      state.currentCodeFileUri
    );
    history.push(`/projects/${project.id}`);
  }

  function* updateExistingProject() {
    const state: AppState = yield select();

    // first handle updates
    for (const path in state.shared.documents) {
      const newContent = state.shared.documents[path];
      const oldContent = _lastSavedState.shared.documents[path];

      if (oldContent !== newContent) {
        yield call(
          api.updateProjectFile,
          state.currentProject.data!.id,
          path,
          newContent
        );
      }
    }

    // next, handle deletes
    for (const path in _lastSavedState.shared.documents) {
      const newContent = state.shared.documents[path];

      if (newContent == null) {
        yield call(api.deleteProjectFile, state.currentProject.data!.id, path);
      }
    }

    _lastSavedState = state;
  }

  yield takeEvery(ActionType.GET_PROJECT_FILES_REQUEST_CHANGED, function*() {
    _lastSavedState = yield select();
  });

  yield takeEvery(ActionType.SAVE_BUTTON_CLICKED, function*() {
    const state: AppState = yield select();

    // create new project
    if (!state.currentProject?.data) {
      yield call(createNewProject);
    } else {
      yield call(updateExistingProject);
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
