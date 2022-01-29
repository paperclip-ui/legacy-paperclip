import { Action } from "..";

export const takeAction =
  (types: string[], handler: (action: Action) => void) => (action: Action) => {
    if (types.includes(action.type)) {
      handler(action);
    }
  };

export const combineActionHandlers =
  (...handlers: Array<(action: Action) => void>) =>
  (action: Action) => {
    for (const handler of handlers) {
      handler(action);
    }
  };
export const disposables = (disposables: Array<() => void>) => () => {
  for (const dispose of disposables) {
    dispose();
  }
};

export const disposableHandler = <TFunc extends (...args: any[]) => () => void>(
  fn: TFunc
) => {
  let prev;

  return (...args: Parameters<TFunc>) => {
    if (prev) {
      prev();
    }

    prev = fn(...args);
  };
};
