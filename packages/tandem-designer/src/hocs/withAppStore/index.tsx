import React from "react";
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { Provider } from "react-redux";

import defaultReducer from "../../reducers";
import { mainSaga } from "../../sagas";
import { INITIAL_STATE } from "../../state";
import { HandleRPCOptions } from "../../sagas/rpc";

export const withAppStore = (Child: React.FC) => (
  options: HandleRPCOptions
) => {
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
    sagaMiddleware.run(mainSaga, document.body, state => state, options);
  };

  return props => {
    init();

    return (
      <Provider store={_store}>
        <Child {...props} />
      </Provider>
    );
  };
};
