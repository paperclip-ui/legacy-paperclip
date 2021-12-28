import React from "react";
import { withAppStore } from "../../hocs";
import { useAppStore } from "../../hooks/useAppStore";
import { CodeMode } from "./CodeMode";
import { DesignMode } from "./DesignMode";
import * as styles from "./index.pc";
import { LeftSidebar } from "./LeftSidebar";

export const MainBase = () => {
  const { state } = useAppStore();
  const showFullEditor =
    (state.designer.workspace?.showFullEditor &&
      !state.designer.ui.query.embedded) ||
    state.designer.showCodeEditorOnStartup;

  const { rounded, showLeftSidebar } = state.designer;
  return (
    <styles.Container
      rounded={rounded}
      showLeftSidebar={showLeftSidebar}
      style={{
        "--code-editor-width": state.designer.codeEditorWidth
      }}
    >
      {showFullEditor && showLeftSidebar !== false && <LeftSidebar />}
      {showFullEditor && <CodeMode />}
      <DesignMode />
    </styles.Container>
  );
};

export const createMain = withAppStore(MainBase);
