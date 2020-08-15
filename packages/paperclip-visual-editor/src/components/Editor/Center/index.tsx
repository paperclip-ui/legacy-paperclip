import React from "react";
import * as styles from "./index.pc";
import { Canvas } from "./Canvas";
import { Toolbar } from "./Toolbar";
import { ErrorBanner } from "./ErrorBanner";
import { useAppStore } from "../../../hooks/useAppStore";

export const Center = () => {
  const { state } = useAppStore();
  return (
    <styles.Container>
      <Toolbar />
      <styles.CanvasContainer>
        <Canvas />
      </styles.CanvasContainer>
      <ErrorBanner error={state.currentError} />
    </styles.Container>
  );
};
