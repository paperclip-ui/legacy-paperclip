import React from "react";
import * as styles from "./index.pc";
import { Canvas } from "./Canvas";
import { Toolbar } from "./Toolbar";
import { ErrorBanner } from "./ErrorBanner";
import { useAppStore } from "../../../hooks/useAppStore";
import { Birdseye } from "./Birdseye";

export const DesignMode = () => {
  const { state, dispatch } = useAppStore();
  return (
    <styles.Container>
      <Toolbar />
      <styles.CanvasContainer>
        {state.ui.pathname === "/canvas" && <Canvas />}
        {state.ui.pathname === "/all" && <Birdseye />}
      </styles.CanvasContainer>
      <ErrorBanner error={state.currentError} dispatch={dispatch} />
    </styles.Container>
  );
};
