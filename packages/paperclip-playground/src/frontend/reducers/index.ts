import { AppState, getNewFilePath } from "../state";
import {
  Action as VEAction,
  ActionType as VEActionType,
} from "paperclip-visual-editor/src/actions";
import { Action, ActionType } from "../actions";
import produce from "immer";

import veReducer from "paperclip-visual-editor/src/reducers/index";
import { editString } from "../utils/string-editor";
import { validate } from "fast-json-patch";
import { resourceLimits } from "worker_threads";

export const reducer = (state: AppState, action: Action) => {
  state = produce(state, (newState) => {
    newState.designMode = veReducer(newState.designMode, action as VEAction);
  });
  switch (action.type) {
    case ActionType.CODE_EDITOR_TEXT_CHANGED: {
      return produce(state, (newState) => {
        newState.designMode.documentContents[state.currentCodeFileUri] =
          action.payload;
      });
    }
    case ActionType.ACCOUNT_CONNECTED: {
      return produce(state, (newState) => {
        newState.loadingUserSession = true;
      });
    }
    case ActionType.LOGOUT_BUTTON_CLICKED: {
      return produce(state, (newState) => {
        newState.user = null;
      });
    }
    case ActionType.SESSION_LOADED: {
      return produce(state, (newState) => {
        newState.user = action.payload;
        newState.loadingUserSession = false;
      });
    }
    case ActionType.SAVED_PROJECT: {
      return produce(state, (newState) => {
        newState.saving = action.payload;
      });
    }
    case ActionType.SAVE_BUTTON_CLICKED: {
      return produce(state, (newState) => {
        newState.saving = { done: false };
      });
    }
    case ActionType.CONTENT_CHANGES_CREATED: {
      return produce(state, (newState) => {
        const changes = action.payload.changes;
        for (const uri in changes) {
          newState.designMode.documentContents[uri] = editString(
            newState.designMode.documentContents[uri],
            changes[uri]
          );
        }

        // flag for saving
        newState.hasUnsavedChanges = true;
      });
    }
    case ActionType.GET_PROJECT_REQUEST_CHANGED: {
      return produce(state, (newState) => {
        newState.currentProject = action.payload.result;
      });
    }
    case ActionType.GET_PROJECT_FILES_REQUEST_CHANGED: {
      return produce(state, (newState) => {
        const result = action.payload.result;

        if (result.data) {
          const contents = result.data!;
          const mainFile = newState.currentProject.data!.mainFileUri
            ? newState.currentProject.data!.files.find((file) => {
                return file.path == newState.currentProject.data!.mainFileUri;
              })
            : newState.currentProject.data!.files[0];
          newState.designMode.ui.query.currentFileUri = mainFile.path;
          newState.designMode.documentContents = contents;
          newState.currentCodeFileUri = mainFile.path;

          // reset canvas zoom
          newState.designMode.centeredInitial = false;
        }
      });
    }
    case VEActionType.LOCATION_CHANGED: {
      return produce(state, (newState) => {
        newState.playgroundUi = action.payload;
      });
    }
    case ActionType.FILE_ITEM_CLICKED: {
      return produce(state, (newState) => {
        newState.currentCodeFileUri = action.payload.uri;
      });
    }
    case ActionType.NEW_FILE_NAME_ENTERED: {
      return produce(state, (newState) => {
        const uri = getNewFilePath(action.payload.value);
        newState.designMode.documentContents[uri] = "";
        newState.currentCodeFileUri = uri;
      });
    }
  }

  return state;
};
