import { AppState } from "../state";
import { produce } from "immer";
import { Action, ActionType } from "../actions";

export default (state: AppState, action: Action) => {
  switch (action.type) {
    case ActionType.ENGINE_EVENT_RECEIVED: {
      return produce(state, newState => {
        newState.currentEngineEvent = action.payload;
        newState.currentEngineError = null;
        newState.currentLoadedData = null;
      });
    }
    case ActionType.ENGINE_ERROR_RECEIVED: {
      return produce(state, newState => {
        newState.currentEngineError = action.payload;
      });
    }
    case ActionType.INIT_RECEIVED: {
      return produce(state, newState => {
        newState.currentLoadedData = action.payload;
        newState.currentEngineError = null;
      });
    }
  }
  return state;
};
