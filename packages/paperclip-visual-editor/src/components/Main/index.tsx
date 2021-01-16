import React from "react";
import { withAppStore } from "../../hocs";
import { DesignMode } from "./DesignMode";
import { LeftSidebar } from "./LeftSidebar";
import * as styles from "./index.pc";
import { useAppStore } from "../../hooks/useAppStore";
import { Router } from "react-router";
import history from "../../dom-history";

export const MainBase = withAppStore(() => {
  const { state } = useAppStore();
  return (
    <Router history={history}>
      <styles.Container className="dark">
        {/* Feels unnecessary with birdseye view - removing for now */}
        {/* {state.embedded ? null : <LeftSidebar />} */}
        <DesignMode />
      </styles.Container>
    </Router>
  );
});

export const Main = withAppStore(MainBase);
