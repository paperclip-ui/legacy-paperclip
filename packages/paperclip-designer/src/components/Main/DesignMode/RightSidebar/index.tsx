import React, { useState } from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import { ResizableContainer } from "../../../ResizableContainer";
import { Inspector2 } from "./Inspector2";

export const RightSidebar = React.memo(() => {
  const { state } = useAppStore();

  if (!state.designer.selectedNodeStyleInspections.length) {
    return null;
  }

  return (
    <>
      <ResizableContainer orientation="right" id="right-panel">
        <Inspector2 />
      </ResizableContainer>
    </>
  );
});
