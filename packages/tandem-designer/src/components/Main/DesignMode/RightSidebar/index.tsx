import React, { useState } from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import { ResizableContainer } from "../../../ResizableContainer";
import { ElementInspector } from "./CSSInspector";

export const RightSidebar = React.memo(() => {
  const { state } = useAppStore();

  if (
    !state.designer.selectedNodeStyleInspections.length ||
    state.designer.ui.query.expanded ||
    state.designer.showInspectorPanels === false
  ) {
    return null;
  }

  return (
    <>
      <ResizableContainer scrollable orientation="right" id="right-panel">
        <ElementInspector />
      </ResizableContainer>
    </>
  );
});
