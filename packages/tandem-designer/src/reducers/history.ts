import produce from "immer";
import { Action, ActionType } from "../actions";
import { HistState } from "../state";

const MAX_HISTORY_ITEMS = 200;

export const historyReducer = (
  mainReducer: (state: HistState, action: Action) => HistState,
  reset: string[] = []
) => {
  return (state: HistState, action: Action) => {
    switch (action.type) {
      case ActionType.GLOBAL_Z_KEY_DOWN: {
        return produce(state, (newState) => {
          const prev = newState.history.past.pop();
          if (prev) {
            newState.history.future.unshift(newState.shared);
            newState.shared = prev;
          }
        });
      }
      case ActionType.GLOBAL_Y_KEY_DOWN: {
        return produce(state, (newState) => {
          const next = newState.history.future.shift();
          if (next) {
            newState.history.past.push(newState.shared);
            newState.shared = next;
          }
        });
      }
      default: {
        if (reset.includes(action.type)) {
          return produce(mainReducer(state, action), (newState) => {
            newState.history.future = [];
            newState.history.past = [];
          });
        }

        const prevState = state;
        let newState = mainReducer(state, action);
        if (newState.shared !== prevState.shared) {
          // TODO - may want to diff this
          newState = produce(newState, (newerState) => {
            newerState.history.past.push(prevState.shared);
            newerState.history.future = [];

            // temporary
            if (newerState.history.past.length > MAX_HISTORY_ITEMS) {
              newerState.history.past.shift();
            }
          });
        }
        return newState;
      }
    }
  };
};
