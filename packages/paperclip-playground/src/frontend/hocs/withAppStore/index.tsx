import React, { useEffect, useState } from "react";
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { AppStoreContext } from "../../contexts";

import { reducer } from "../../reducers";
import { init } from "../../sagas";
import { INITIAL_STATE } from "../../state";

export const withAppStore = (Child: React.FC) => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    reducer,
    INITIAL_STATE,
    applyMiddleware(sagaMiddleware)
  );
  sagaMiddleware.run(init);

  return (props) => {
    const [state, setState] = useState(store.getState());

    useEffect(() => {
      return store.subscribe(() => {
        setState(store.getState());
      });
    }, []);

    return (
      <AppStoreContext.Provider value={{ dispatch: store.dispatch, state }}>
        <Child {...props} />
      </AppStoreContext.Provider>
    );
  };
};
