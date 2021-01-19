import React, { useMemo } from "react";
import { MainBase as DesignModeMainBase } from "paperclip-visual-editor/src/components/Main";
import { AppStoreContext as DesignModeAppStoreContext } from "paperclip-visual-editor/src/contexts";
import { withAppStore } from "../../hocs/withAppStore";
import { useAppStore } from "../../hooks/useAppStore";
import { MainToolbar } from "./Toolbar";
import * as styles from "./index.pc";
import { CodeMode } from "./CodeMode";
import { Router } from "react-router";

export const Main = withAppStore(() => {
  const store = useAppStore();
  const { compact } = store.state;
  const designModeStore = useMemo(() => {
    return { state: store.state.designMode, dispatch: store.dispatch };
  }, [store.state.designMode]);
  return (
    <styles.Container>
      {!compact && <MainToolbar />}
      <styles.EditorContainer compact={store.state.compact}>
        <CodeMode />
        <DesignModeAppStoreContext.Provider value={designModeStore}>
          <DesignModeMainBase />
        </DesignModeAppStoreContext.Provider>
      </styles.EditorContainer>
    </styles.Container>
  );
});
