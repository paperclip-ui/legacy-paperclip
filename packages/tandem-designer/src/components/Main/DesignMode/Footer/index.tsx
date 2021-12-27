import React from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { useSelector } from "react-redux";
import { AppState } from "../../../../state";
import { ResizableContainer } from "../../../ResizableContainer";
import { Layers } from "./Layers";
import * as styles from "./index.pc";

const BREADCRUMB_HEIGHT = 32;

export const Footer = React.memo(() => {
  const state: AppState = useSelector(identity);
  if (
    state.designer.ui.query.expanded ||
    state.designer.showInspectorPanels === false
  ) {
    return null;
  }

  return (
    <ResizableContainer
      minSize={BREADCRUMB_HEIGHT}
      active={state.designer.selectedNodePaths.length === 1}
      orientation="bottom"
      id="footer"
    >
      <styles.Container>
        <Breadcrumbs />
        <Layers />
      </styles.Container>
    </ResizableContainer>
  );
});

const identity = v => v;
