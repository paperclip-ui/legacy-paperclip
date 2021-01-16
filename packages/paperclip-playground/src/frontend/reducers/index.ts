import { AppState } from "../state";
import { Action as VEAction } from "paperclip-visual-editor/src/actions";
import { Action, ActionType } from "../actions";
import produce from "immer";

import veReducer from "paperclip-visual-editor/src/reducers/index";

export const reducer = (state: AppState, action: Action) => {
  state = veReducer(state, action as VEAction) as AppState;
  switch (action.type) {
    case ActionType.CODE_EDITOR_TEXT_CHANGED: {
      return produce(state, (newState) => {
        newState.documentContents[state.ui.query.currentFileUri] =
          action.payload;
      });
    }
  }

  return state;
};
