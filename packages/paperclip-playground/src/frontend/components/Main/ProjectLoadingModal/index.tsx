import React, { useEffect, useState } from "react";
import { memo } from "react";
import { useAppStore } from "../../../hooks/useAppStore";
import * as styles from "./index.pc";

export const ProjectLoadingModal = memo(() => {
  const {state} = useAppStore();

  const [visible, setVisible] = useState<boolean>();

  useEffect(() => {
    const newVisible = Boolean(state.currentProject?.data && state.progressLoadedPercent < 1);

    setVisible(newVisible);
  }, [state.progressLoadedPercent, state.currentProject])

  return <styles.Modal visible={visible} percent={state.progressLoadedPercent} />
});