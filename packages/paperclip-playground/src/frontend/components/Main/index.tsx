import React, { memo, useMemo } from "react";
import { MainBase as DesignModeMainBase } from "paperclip-designer/src/components/Main";
import { AppStoreContext as DesignModeAppStoreContext } from "paperclip-designer/src/contexts";
import history from "paperclip-designer/src/dom-history";
import { withAppStore } from "../../hocs/withAppStore";
import { useAppStore } from "../../hooks/useAppStore";
import { MainToolbar } from "./Toolbar";
import * as styles from "./index.pc";
import { CodeMode } from "./CodeMode";
import { APP_LOCATIONS, matchesLocationPath } from "../../state";
import { Projects } from "./Projects";
import { Route, Router, Switch } from "react-router";

export const Main = withAppStore(() => {
  const store = useAppStore();
  const { compact, playgroundUi } = store.state;
  if (compact) {
    return <Editor />
  };

  return <Router history={history}>
    <Switch>
      <Route path={APP_LOCATIONS.PROJECT}>
        <Editor />
      </Route>
      <Route path={APP_LOCATIONS.PROJECTS}>
        <Projects />
      </Route>
      <Route path="/">
        <Editor />
      </Route>
    </Switch>
  </Router>
});

const Editor = memo(() => {
  const store = useAppStore();
  const { compact } = store.state;
  return <styles.Container>
  {!compact && <MainToolbar />}
  <styles.EditorContainer compact={store.state.compact}>
    <CodeMode />
    <DesignModeAppStoreContext.Provider value={store}>
      <DesignModeMainBase />
    </DesignModeAppStoreContext.Provider>
  </styles.EditorContainer>
</styles.Container>
});