import React from "react";
import * as styles from "./index.pc";
import { Canvas } from "./Canvas";
import { Toolbar } from "./Toolbar";
import { ErrorBanner } from "./ErrorBanner";
import { useAppStore } from "../../../hooks/useAppStore";
import { Birdseye } from "./Birdseye";
import { Route } from "react-router";

export const Center = () => {
  const { state, dispatch } = useAppStore();
  return (
    <styles.Container>
      <Toolbar />
      <styles.CanvasContainer>
        <Route path="/canvas">
          <Canvas />
        </Route>
        <Route path="/all">
          <Birdseye />
        </Route>
      </styles.CanvasContainer>
      <ErrorBanner error={state.currentError} dispatch={dispatch} />
    </styles.Container>
  );
};

// const a: HTMLIFrameElement;

// a.on
