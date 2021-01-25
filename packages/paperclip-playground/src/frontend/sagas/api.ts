import {
  AppState,
  APP_LOCATIONS,
  matchesLocationPath,
  Project,
  ProjectFile
} from "../state";
import { call, fork, put, select, takeEvery } from "redux-saga/effects";
import history from "paperclip-designer/src/dom-history";
import * as vea from "paperclip-designer/src/actions";
import {
  AccountConnected,
  ActionType,
  DeleteProjectConfirmed,
  FilesDropped,
  getProjectsRequestChanged,
  loggedOut,
  NewProjectEntered,
  ProjectRenamed,
  rawFileUploaded,
  savedProject,
  sessionRequestStateChanged
} from "../actions";
import * as api from "../api";
import { mapValues, matchesProperty } from "lodash";
import { request } from "./utils";
import { isPaperclipFile } from "paperclip-utils";

export function* handleAPI() {
  yield fork(handleAccountConnected);
  yield fork(handleSession);
  yield fork(handleProjectChanges);
}

function* handleAccountConnected() {
  yield takeEvery(ActionType.ACCOUNT_CONNECTED, function*({
    payload: { kind, details }
  }: AccountConnected) {
    yield request(sessionRequestStateChanged, function*() {
      return yield call(api.connectAccount, kind, details);
    });
  });
}

function* handleSession() {
  yield takeEvery(ActionType.LOGOUT_BUTTON_CLICKED, function*() {
    yield call(api.logout);
    yield put(loggedOut(null));
    history.push("/");
  });
  yield call(loadSession);
}

function* handleProjectChanges() {
  let _lastSavedState: AppState;
  // user logged in after editing content
  // yield takeEvery(ActionType.SESSION_LOADED, function*() {
  //   const state: AppState = yield select();
  //   if (state.hasUnsavedChanges) {

  //   }
  // })

  function* createBlankNewProject() {
    //TODO - need to dispatch promptRequested & then action go with that
    const name = prompt(`New project name`);
    if (!name) {
      return;
    }

    const state: AppState = yield select();

    const project = yield call(
      api.createProject,
      name,
      {},
      isPaperclipFile(state.currentCodeFileUri)
        ? state.currentCodeFileUri
        : Object.keys(state.shared.documents).find(isPaperclipFile)
    );

    for (const uri in state.shared.documents) {
      yield call(
        api.updateProjectFile,
        project.id,
        uri,
        state.shared.documents[uri]
      );
    }

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

  function* loadProjects() {
    yield request(getProjectsRequestChanged, function*() {
      return yield call(api.getProjects);
    });
  }

  yield takeEvery(
    [
      ActionType.GET_PROJECT_FILES_REQUEST_CHANGED,
      ActionType.RAW_FILE_UPLOADED
    ],
    function*() {
      _lastSavedState = yield select();
    }
  );

  yield takeEvery(
    [ActionType.SAVE_BUTTON_CLICKED, vea.ActionType.GLOBAL_SAVE_KEY_DOWN],
    function*() {
      const state: AppState = yield select();
      if (!state.user) {
        return alert(`You need to be logged in for to save this project!`);
      }

      // create new project
      if (!state.currentProject?.data) {
        yield call(createBlankNewProject);
      } else {
        yield call(updateExistingProject);
      }

      yield put(savedProject({ data: true, done: true }));
    }
  );

  yield takeEvery([ActionType.DELETE_PROJECT_CONFIRMED], function*(
    action: DeleteProjectConfirmed
  ) {
    yield call(api.deleteProject, action.payload.projectId);
    yield call(loadProjects);
  });
  yield takeEvery([ActionType.PROJECT_RENAMED], function*(
    action: ProjectRenamed
  ) {
    yield call(api.updateProject, action.payload.projectId, {
      name: action.payload.newName
    });
  });
  yield takeEvery([ActionType.NEW_PROJECT_ENTERED], function*(
    action: NewProjectEntered
  ) {
    const project = yield call(
      api.createProject,
      action.payload.name,
      {
        "file:///main.pc": ""
      },
      "file:///main.pc"
    );

    history.push(`/projects/${project.id}`);
  });

  // yield takeEvery([ActionType.FILES_DROPPED], function*({
  //   payload
  // }: FilesDropped) {
  //   const files = Array.from(payload.files);
  //   const state: AppState = yield select();

  //   for (const file of files) {

  //     yield call(function*() {
  //       const { path }: ProjectFile = yield call(api.updateRawProjectFile, state.currentProject.data.id, file);
  //       yield put(rawFileUploaded({ path, data: file }));
  //     });
  //   }

  // });
}

function* loadSession() {
  yield request(sessionRequestStateChanged, api.getUser);
}
