import React from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import * as styles from "./index.pc";

export const Toolbar = () => {
  const { state } = useAppStore();
  return <styles.Topbar>{null}</styles.Topbar>;
};
