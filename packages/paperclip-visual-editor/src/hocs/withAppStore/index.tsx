import React, { useEffect, useState } from "react";
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { AppStoreContext } from "../../contexts";

import defaultReducer from "../../reducers";
import defaultSaga from "../../sagas";
import { INITIAL_STATE } from "../../state";

export const withAppStore = (render: React.FC) => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    defaultReducer,
    INITIAL_STATE,
    applyMiddleware(sagaMiddleware)
  );
  sagaMiddleware.run(defaultSaga);

  return props => {
    const [state, setState] = useState(store.getState());

    useEffect(() => {
      return store.subscribe(() => {
        setState(store.getState());
      });
    }, []);

    return (
      <AppStoreContext.Provider value={{ dispatch: store.dispatch, state }}>
        {render(props)}
      </AppStoreContext.Provider>
    );
  };
};
