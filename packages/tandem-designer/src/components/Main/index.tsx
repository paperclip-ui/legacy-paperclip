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
    state.designer.workspace?.showFullEditor &&
    !state.designer.ui.query.embedded;
  return (
    <styles.Container>
      {showFullEditor && <LeftSidebar />}
      {showFullEditor && <CodeMode />}
      <DesignMode />
    </styles.Container>
  );
};

export const Main = withAppStore(MainBase);
