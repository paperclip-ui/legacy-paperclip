import React, { useEffect, useState } from "react";
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { Provider } from "react-redux";

import defaultReducer from "../../reducers";
import { mainSaga, MainSagaOptions } from "../../sagas";
import { AppState, INITIAL_STATE } from "../../state";
import produce from "immer";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { sockjsClientAdapter } from "@paperclip-ui/common";
import SockJSClient from "sockjs-client";
import { WorkspaceProjectContext } from "../../contexts";

export type WithAppStoreOptions = {
  showLaunchExternalButton?: boolean;
  useLiteEditor?: boolean;
  showCodeToolbar?: boolean;
  showLeftSidebar?: boolean;
  showInspectorPanels?: boolean;
  floatingPreview?: boolean;
  rounded?: boolean;
  codeEditorWidth?: string;
  activeFrame?: number;
  showCodeEditorOnStartup?: boolean;
} & MainSagaOptions;

export const withAppStore = (Child: React.FC) => (
  options: WithAppStoreOptions
) => {
  let _inited = false;
  let _store;
  const client = new WorkspaceClient(
    sockjsClientAdapter(
      new SockJSClient(location.protocol + "//" + location.host + "/rt")
    )
  );

  const init = () => {
    if (_inited) {
      return;
    }

    const state = createState(options);

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

    const [project, setProject] = useState(null);

    useEffect(() => {
      client
        .openProject({
          id: new URLSearchParams(location.search).get("projectId")
        })
        .then(setProject);
    }, []);

    return (
      <Provider store={_store}>
        <WorkspaceProjectContext.Provider value={project}>
          <Child {...props} />
        </WorkspaceProjectContext.Provider>
      </Provider>
    );
  };
};

const createState = ({
  showLaunchExternalButton,
  useLiteEditor,
  showCodeToolbar,
  showLeftSidebar,
  showInspectorPanels,
  showCodeEditorOnStartup,
  codeEditorWidth,
  activeFrame,
  floatingPreview,
  rounded
}: WithAppStoreOptions) => {
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
    if (floatingPreview != null) {
      newState.designer.floatingPreview = floatingPreview;
    }
  });

  return state;
};
