import React, { useEffect, useState } from "react";
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { AppStoreContext } from "../../contexts";

import defaultReducer from "../../reducers";
import defaultSaga from "../../sagas";
import { INITIAL_STATE } from "../../state";

export const withAppStore = (Child: React.FC) => {
  let _inited = false;
  let _store;

  const init = () => {
    if (_inited) {
      return;
    }

    _inited = true;
    const sagaMiddleware = createSagaMiddleware();
    _store = createStore(
      defaultReducer,
      INITIAL_STATE,
      applyMiddleware(sagaMiddleware)
    );
    sagaMiddleware.run(defaultSaga, document.body, (state) => state);
  };

  return (props) => {
    init();
    const [state, setState] = useState(_store.getState());

    useEffect(() => {
      return _store.subscribe(() => {
        setState(_store.getState());
      });
    }, []);

    return (
      <AppStoreContext.Provider value={{ dispatch: _store.dispatch, state }}>
        <Child {...props} />
      </AppStoreContext.Provider>
    );
  };
};
