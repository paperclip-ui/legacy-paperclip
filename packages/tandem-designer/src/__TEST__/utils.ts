export const middlewareSpy = () => {
  let waitType;
  let resolveAction;

  const waitForAction = (type: string) => {
    waitType = type;
    return new Promise((resolve) => {
      resolveAction = resolve;
    });
  };

  const middleware = () => (next) => (action) => {
    next(action);
    if (action.type === waitType) {
      resolveAction(action);
    }
  };

  return {
    middleware,
    waitForAction,
  };
};
