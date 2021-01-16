import React from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import * as styles from "./index.pc";

export const Toolbar = () => {
  const { state } = useAppStore();
  console.log(state);
  return <styles.Topbar></styles.Topbar>;
};
