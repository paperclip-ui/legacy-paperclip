import React from "react";
import { Provider } from "react-redux";
import { useAppStore } from "../../hooks/useAppStore";
import { CodeMode } from "./CodeMode";
import { createAppStore, CreateAppStoreOptions } from "./create-app-store";
import { DesignMode } from "./DesignMode";
import * as styles from "./index.pc";
import { LeftSidebar } from "./LeftSidebar";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

export const MainBase = () => {
  const { state } = useAppStore();
  const showFullEditor =
    (state.designer.workspace?.showFullEditor &&
      !state.designer.ui.query.embedded) ||
    state.designer.showCodeEditorOnStartup;

  const { rounded, showLeftSidebar, floatingPreview } = state.designer;

  let content = (
    <styles.Container
      rounded={rounded}
      showLeftSidebar={showLeftSidebar}
      floatingPreview={floatingPreview}
      style={{
        "--code-editor-width": state.designer.codeEditorWidth,
      }}
    >
      {showFullEditor && showLeftSidebar !== false && <LeftSidebar />}
      {showFullEditor && <CodeMode />}
      <DesignMode floating={floatingPreview} />
    </styles.Container>
  );

  return content;
};

export const createMain = (options: CreateAppStoreOptions) => {
  const store = createAppStore(options);
  return () => {
    return (
      <Provider store={store}>
        <DndProvider backend={HTML5Backend}>
          <MainBase />
        </DndProvider>
      </Provider>
    );
  };
};
