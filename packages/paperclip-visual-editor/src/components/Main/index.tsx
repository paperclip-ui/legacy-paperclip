import React from "react";
import { withAppStore } from "../../hocs";
import { DesignMode } from "./DesignMode";
import * as styles from "./index.pc";
import { useAppStore } from "../../hooks/useAppStore";

export const MainBase = () => {
  const { state } = useAppStore();
  return (
    <styles.Container className="dark">
      {/* Feels unnecessary with birdseye view - removing for now */}
      {/* {state.embedded ? null : <LeftSidebar />} */}
      <DesignMode />
    </styles.Container>
  );
};

export const Main = withAppStore(MainBase);
