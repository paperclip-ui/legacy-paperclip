import { Action } from "..";
import { AppState } from "../state";

export type Store = {
  getState(): AppState;
  dispatch(action: Action): void;
};
