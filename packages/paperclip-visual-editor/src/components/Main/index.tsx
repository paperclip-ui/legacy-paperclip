import React from "react";
import { withAppStore } from "../../hocs";
import { DesignMode } from "./DesignMode";
import * as styles from "./index.pc";
import { useAppStore } from "../../hooks/useAppStore";

export const MainBase = () => {
  return (
    <styles.Container>
      <DesignMode />
    </styles.Container>
  );
};

export const Main = withAppStore(MainBase);
