import React, { useState } from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import { ResizableContainer } from "../../../ResizableContainer";
import { Inspector2 } from "./CSSInspector";

export const RightSidebar = React.memo(() => {
  const { state } = useAppStore();

  if (
    !state.designer.selectedNodeStyleInspections.length ||
    state.designer.ui.query.expanded
  ) {
    return null;
  }

  return (
    <>
      <ResizableContainer scrollable orientation="right" id="right-panel">
        <Inspector2 />
      </ResizableContainer>
    </>
  );
});
