import { Middleware, Store } from "redux";
import { Action } from "..";
import { AppState } from "../state";

export abstract class BaseEngine {
  constructor(private _store: { getState; dispatch }) {
    this.initialize();
  }
  abstract initialize(): void;
  getState(): AppState {
    return this._store.getState();
  }
  dispatch(event: Action) {
    return this._store.dispatch(event);
  }
  onEvent(event: Action) {
    // override me
  }
}

export const createEngineMiddleware = (createEngine) => (store) => {
  const engine = createEngine(store);
  return (next) => (action) => {
    engine.onEvent(action);
    return next(action);
  };
};
