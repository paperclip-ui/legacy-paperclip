import { Action } from "../actions";
import { AppState } from "../state";
import { reduceDesigner } from "./designer";
import { sharedReducer } from "./shared";

const MIN_ZOOM = 0.01;
const MAX_ZOOM = 6400 / 100;

export default (state: AppState, action: Action) => {
  const newDesigner = reduceDesigner(state.designer, action);
  if (newDesigner !== state.designer) {
    state = { ...state, designer: newDesigner };
  }

  state = sharedReducer(state, action);

  return state;
};
