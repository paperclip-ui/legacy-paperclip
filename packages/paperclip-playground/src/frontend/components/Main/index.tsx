import React from "react";
import { MainBase as DesignModeMainBase } from "paperclip-visual-editor/src/components/Main";
import { AppStoreContext as DesignModeAppStoreContext } from "paperclip-visual-editor/src/contexts";
import { withAppStore } from "../../hocs/withAppStore";
import { useAppStore } from "../../hooks/useAppStore";
import * as styles from "./index.pc";
import { CodeMode } from "./CodeMode";

export const Main = withAppStore(() => {
  const store = useAppStore();
  return (
    <styles.Container>
      <CodeMode />
      <DesignModeAppStoreContext.Provider value={store}>
        <DesignModeMainBase />
      </DesignModeAppStoreContext.Provider>
    </styles.Container>
  );
});
