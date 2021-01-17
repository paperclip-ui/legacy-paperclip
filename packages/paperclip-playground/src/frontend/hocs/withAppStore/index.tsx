import React, { useEffect, useState } from "react";
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { AppStoreContext } from "../../contexts";

import { reducer } from "../../reducers";
import { init } from "../../sagas";
import { INITIAL_STATE, AppState } from "../../state";

type InitOptions = Partial<{
  compact: boolean;
  mainDocumentUri: string;
  documents: Record<string, string>;
  activeFrameIndex?: number;
  slim: boolean;
}>;

export const createAppStore = ({
  compact,
  mainDocumentUri,
  documents,
  activeFrameIndex,
  slim,
}: InitOptions = {}) => {
  const sagaMiddleware = createSagaMiddleware();
  const mainUri =
    mainDocumentUri ||
    (Object.keys(documents || {}).length
      ? Object.keys(documents)[0]
      : INITIAL_STATE.currentCodeFileUri);
  const store = createStore(
    reducer,
    {
      ...INITIAL_STATE,
      slim: slim != null ? slim : INITIAL_STATE.slim,
      compact: compact || INITIAL_STATE.compact,
      documentContents: documents || INITIAL_STATE.documentContents,
      currentCodeFileUri: mainUri,
      ui: {
        ...INITIAL_STATE.ui,
        query: {
          ...INITIAL_STATE.ui.query,
          currentFileUri: mainUri,
          frame: activeFrameIndex,
          expanded: activeFrameIndex != null,
        },
      },
    },
    applyMiddleware(sagaMiddleware)
  );
  sagaMiddleware.run(init);
  return store;
};

export const withAppStore = (Child: React.FC) => {
  return (props) => {
    const { store } = props;
    const [state, setState] = useState(store.getState());

    useEffect(() => {
      return store.subscribe(() => {
        setState(store.getState());
      });
    }, [store]);

    return (
      <AppStoreContext.Provider value={{ dispatch: store.dispatch, state }}>
        <Child {...props} />
      </AppStoreContext.Provider>
    );
  };
};
