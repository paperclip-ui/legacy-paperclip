import { AppState, getNewFilePath } from "../state";
import { Action as VEAction } from "paperclip-visual-editor/src/actions";
import { Action, ActionType } from "../actions";
import produce from "immer";

import veReducer from "paperclip-visual-editor/src/reducers/index";
import { editString } from "../utils/string-editor";

export const reducer = (state: AppState, action: Action) => {
  state = veReducer(state, action as VEAction) as AppState;
  switch (action.type) {
    case ActionType.CODE_EDITOR_TEXT_CHANGED: {
      return produce(state, (newState) => {
        newState.documentContents[state.currentCodeFileUri] = action.payload;
      });
    }
    case ActionType.ACCOUNT_CONNECTED: {
      return produce(state, (newState) => {
        newState.loadingUserSession = true;
      });
    }
    case ActionType.SESSION_LOADED: {
      return produce(state, (newState) => {
        newState.user = action.payload;
        newState.loadingUserSession = false;
      });
    }
    case ActionType.CONTENT_CHANGES_CREATED: {
      return produce(state, (newState) => {
        const changes = action.payload.changes;
        for (const uri in changes) {
          newState.documentContents[uri] = editString(
            newState.documentContents[uri],
            changes[uri]
          );
        }
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
        newState.documentContents[uri] = "";
        newState.currentCodeFileUri = uri;
      });
    }
  }

  return state;
};
