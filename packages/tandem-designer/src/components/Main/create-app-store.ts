import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { Middleware } from "redux";

import defaultReducer from "../../reducers";
import { mainSaga, MainSagaOptions } from "../../sagas";
import { AppState, DesignerState, INITIAL_STATE } from "../../state";
import produce from "immer";
import { engineMiddleware, EngineOptions } from "../../engines";

export type CreateAppStoreOptions = {
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
  middleware?: Middleware;
  initialDesignerState?: Partial<DesignerState>;
} & MainSagaOptions &
  EngineOptions;

const noMiddleware = () => (next) => (action) => next(action);

export const createAppStore = (options: CreateAppStoreOptions) => {
  const state = createState(options);

  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    defaultReducer,
    state,
    applyMiddleware(
      sagaMiddleware,
      engineMiddleware(options),
      options.middleware || noMiddleware
    )
  );

  // DEPRECATED
  sagaMiddleware.run(mainSaga, document.body, (state) => state, options);

  return store;
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
  initialDesignerState,
  floatingPreview,
  rounded,
}: CreateAppStoreOptions) => {
  let state: AppState = {
    ...INITIAL_STATE,
    designer: {
      ...INITIAL_STATE.designer,
      ...(initialDesignerState || {}),
      codeEditorWidth,
    },
  };
  state = produce(state, (newState) => {
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
