import { handleEngine } from "./engine";
import { fork, put, select, takeEvery } from "redux-saga/effects";
import veSaga from "@tandemui/designer/src/sagas";
import * as vea from "@tandemui/designer/src/actions";
import { ActionType, NewFileNameEntered } from "../actions";
import { redirectRequest } from "@tandemui/designer/src/actions";
import { getNewFilePath, hasUnsavedChanges } from "../state";
import { AppState } from "../state";
import { handleAPI } from "./api";
import { handleLocation } from "./location";
import { eventChannel } from "redux-saga";
import { emit } from "process";

export function* init(mount: HTMLDivElement) {
  yield fork(handleEngine);
  yield fork(veSaga, mount, (state: AppState) => state);
  yield fork(handleApp);
  yield fork(handleAPI);
  yield fork(handleLocation);
  yield fork(handleLeave);
}

function* handleApp() {
  yield fork(handleNewFile);
}

function* handleNewFile() {
  yield takeEvery(ActionType.NEW_FILE_NAME_ENTERED, function*(
    action: NewFileNameEntered
  ) {
    yield put(
      redirectRequest({
        query: {
          canvasFile: action.payload.uri
        }
      })
    );
  });
  yield takeEvery(ActionType.SYNC_PANELS_CLICKED, function*() {
    const state: AppState = yield select();
    yield put(
      redirectRequest({
        query: {
          canvasFile: state.currentCodeFilePath
        }
      })
    );
  });
}

function* handleLeave() {
  let _savedState: AppState = yield select();
  let _currentState: AppState = yield select();

  eventChannel(() => {
    window.onbeforeunload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges(_currentState, _savedState)) {
        return "You have unsaved changes, are you sure you want to leave?";
      }
    };
    return () => {};
  });

  yield takeEvery(
    [ActionType.SAVED_PROJECT, ActionType.GET_PROJECT_FILES_REQUEST_CHANGED],
    function*() {
      _savedState = _currentState = yield select();
    }
  );

  yield takeEvery(
    [
      ActionType.CONTENT_CHANGES_CREATED,
      vea.ActionType.GLOBAL_Y_KEY_DOWN,
      vea.ActionType.GLOBAL_Y_KEY_DOWN,
      ActionType.SLIM_CODE_EDITOR_TEXT_CHANGED,
      ActionType.CODE_EDITOR_TEXT_CHANGED
    ],
    function*(e: BeforeUnloadEvent) {
      _currentState = yield select();
    }
  );
}
