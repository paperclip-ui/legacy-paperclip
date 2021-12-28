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
  showCodeToolbar?: boolean;
  showLeftSidebar?: boolean;
  showInspectorPanels?: boolean;
  rounded?: boolean;
  codeEditorWidth?: string;
  activeFrame?: number;
  showCodeEditorOnStartup?: boolean;
} & MainSagaOptions;

export const withAppStore = (Child: React.FC) => ({
  showLaunchExternalButton,
  useLiteEditor,
  showCodeToolbar,
  showLeftSidebar,
  showInspectorPanels,
  showCodeEditorOnStartup,
  codeEditorWidth,
  activeFrame,
  rounded,
  ...options
}: WithAppStoreOptions) => {
  let _inited = false;
  let _store;

  const init = () => {
    if (_inited) {
      return;
    }

    let state: AppState = {
      ...INITIAL_STATE,
      designer: {
        ...INITIAL_STATE.designer,
        codeEditorWidth
      }
    };
    state = produce(state, newState => {
      if (showLaunchExternalButton != null) {
        newState.designer.sharable = showLaunchExternalButton;
      }
      if (useLiteEditor != null) {
        newState.designer.useLiteEditor = useLiteEditor;
      }
      if (showCodeToolbar != null) {
        newState.designer.showCodeToolbar = showCodeToolbar;
      }
      if (showLeftSidebar != null) {
        newState.designer.showLeftSidebar = showLeftSidebar;
      }
      if (showInspectorPanels != null) {
        newState.designer.showInspectorPanels = showInspectorPanels;
      }

      if (activeFrame != null) {
        newState.designer.ui.query.frame = activeFrame;
        newState.designer.ui.query.expanded = true;
      }

      if (rounded != null) {
        newState.designer.rounded = rounded;
      }
      if (showCodeEditorOnStartup != null) {
        newState.designer.showCodeEditorOnStartup = showCodeEditorOnStartup;
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
