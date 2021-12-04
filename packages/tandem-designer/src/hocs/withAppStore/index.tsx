import React from "react";
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { Provider } from "react-redux";

import defaultReducer from "../../reducers";
import defaultSaga from "../../sagas";
import { INITIAL_STATE } from "../../state";
import { rpcEngine } from "../../engines/rpc";

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

    // DEPRECATED
    sagaMiddleware.run(defaultSaga, document.body, (state) => state);
  };

  return (props) => {
    init();

    return (
      <Provider store={_store}>
        <Child {...props} />
      </Provider>
    );
  };
};
