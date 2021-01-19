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
