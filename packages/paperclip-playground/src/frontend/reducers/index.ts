import { AppState } from "../state";
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
        newState.documentContents[state.ui.query.currentFileUri] =
          action.payload;
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
  }

  return state;
};
