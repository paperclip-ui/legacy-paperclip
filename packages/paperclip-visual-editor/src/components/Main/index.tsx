import React from "react";
import { withAppStore } from "../../hocs";
import { DesignMode } from "./DesignMode";
import { LeftSidebar } from "./LeftSidebar";
import * as styles from "./index.pc";
import { useAppStore } from "../../hooks/useAppStore";
import { Router } from "react-router";
import history from "../../dom-history";
import { CodeMode } from "./CodeMode";

export const Editor = withAppStore(() => {
  const { state } = useAppStore();
  return (
    <Router history={history}>
      <styles.Container className="dark">
        {/* Feels unnecessary with birdseye view - removing for now */}
        {/* {state.embedded ? null : <LeftSidebar />} */}
        <CodeMode />
        <DesignMode />
      </styles.Container>
    </Router>
  );
});
