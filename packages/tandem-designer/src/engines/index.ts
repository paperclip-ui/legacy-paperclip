import { Store } from "./base";
import { workspaceEngine, WorkspaceEngineOptions } from "./workspace";

export type EngineOptions = WorkspaceEngineOptions;

export const engineMiddleware = (options: EngineOptions) => (store: Store) => {
  const engines = [workspaceEngine(store, options)];
  return (next) => (action) => {
    next(action);
    for (const engine of engines) {
      engine(action);
    }
  };
};
