import { Store } from "./base";
import { workspaceEngine } from "./workspace";
export const engineMiddleware = (store: Store) => {
  const engines = [workspaceEngine(store)];
  return (next) => (action) => {
    next(action);
    for (const engine of engines) {
      engine(action);
    }
  };
};
