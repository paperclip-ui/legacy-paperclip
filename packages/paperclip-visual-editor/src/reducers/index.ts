import { AppState, mergeBoxesFromClientRects } from "../state";
import { produce } from "immer";
import { Action, ActionType } from "../actions";

export default (state: AppState, action: Action) => {
  switch (action.type) {
    case ActionType.RENDERER_INITIALIZED: {
      return produce(state, newState => {
        newState.rendererElement = action.payload.element as any;
      });
    }
    case ActionType.RECTS_CAPTURED: {
      return produce(state, newState => {
        newState.boxes = mergeBoxesFromClientRects(
          newState.boxes,
          action.payload
        );
      });
    }
    case ActionType.RENDERER_CHANGED: {
      return produce(state, newState => {
        newState.virtualRootNode = action.payload.virtualRoot;
      });
    }
  }
  return state;
};
