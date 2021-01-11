import React from "react";
import { withAppStore } from "../../hocs";
import { Center } from "./Center";
import { LeftSidebar } from "./LeftSidebar";
import * as styles from "./index.pc";
import { useAppStore } from "../../hooks/useAppStore";
import { Router } from "react-router";
import history from "../../dom-history";

export const Editor = withAppStore(() => {
  const { state } = useAppStore();
  return (
    <Router history={history}>
      <styles.Container className="dark">
        {/* Feels unnecessary with birdseye view - removing for now */}
        {/* {state.embedded ? null : <LeftSidebar />} */}
        <Center />
      </styles.Container>
    </Router>
  );
});
