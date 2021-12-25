import React, { useEffect, useState } from "react";
import { memo } from "react";
import { useAppStore } from "../../../hooks/useAppStore";
import * as styles from "./index.pc";

export const ProjectLoadingModal = memo(() => {
  const { state } = useAppStore();
  return (
    <styles.Modal
      visible={state.currentProject && !state.currentProjectFiles?.done}
      percent={state.progressLoadedPercent}
    />
  );
});
