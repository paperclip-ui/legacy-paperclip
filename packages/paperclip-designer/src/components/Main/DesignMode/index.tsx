import React from "react";
import * as styles from "./index.pc";
import { Canvas } from "./Canvas";
import { Toolbar } from "./Toolbar";
import { ErrorBanner } from "./ErrorBanner";
import { useAppStore } from "../../../hooks/useAppStore";
import { Birdseye } from "./Birdseye";
import { RightSidebar } from "./RightSidebar";
import { Footer } from "./Footer";

export const DesignMode = () => {
  const { state, dispatch } = useAppStore();

  return (
    <styles.Container>
      <Toolbar />
      <styles.CanvasContainer>
        {state.designer.ui.pathname === "/canvas" && (
          <styles.Center>
            <Canvas />
            <Footer />
          </styles.Center>
        )}
        {state.designer.ui.pathname === "/all" && <Birdseye />}
        <RightSidebar />
      </styles.CanvasContainer>
      <ErrorBanner error={state.designer.currentError} dispatch={dispatch} />
    </styles.Container>
  );
};
