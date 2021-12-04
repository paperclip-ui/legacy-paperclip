import produce from "immer";
import { Action, ActionType } from "../actions";
import { AppState } from "../state";
import { reduceDesigner } from "./designer";
import { sharedReducer } from "./shared";

export default (state: AppState, action: Action) => {
  const newDesigner = reduceDesigner(state.designer, action);
  if (newDesigner !== state.designer) {
    state = { ...state, designer: newDesigner };
  }

  state = sharedReducer(state, action);

  switch (action.type) {
    case ActionType.ACTION_HANDLED: {
      return produce(state, (newState) => {
        newState.actions.shift();
      });
    }
  }

  return state;
};
