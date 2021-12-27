import React from "react";
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { Provider } from "react-redux";

import defaultReducer from "../../reducers";
import { mainSaga, MainSagaOptions } from "../../sagas";
import { AppState, INITIAL_STATE } from "../../state";
import produce from "immer";

export type WithAppStoreOptions = {
  showLaunchExternalButton?: boolean;
  useLiteEditor?: boolean;
} & MainSagaOptions;

export const withAppStore = (Child: React.FC) => ({
  showLaunchExternalButton,
  useLiteEditor,
  ...options
}: WithAppStoreOptions) => {
  let _inited = false;
  let _store;

  const init = () => {
    if (_inited) {
      return;
    }

    let state: AppState = INITIAL_STATE;
    state = produce(state, newState => {
      if (showLaunchExternalButton != null) {
        newState.designer.sharable = showLaunchExternalButton;
      }
      if (useLiteEditor != null) {
        newState.designer.useLiteEditor = useLiteEditor;
      }
    });

    _inited = true;
    const sagaMiddleware = createSagaMiddleware();
    _store = createStore(
      defaultReducer,
      state,
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
