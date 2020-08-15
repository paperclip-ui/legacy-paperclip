import React from "react";
import * as styles from "./index.pc";
import { Canvas } from "./Canvas";
import { Toolbar } from "./Toolbar";

export const Center = () => {
  return (
    <styles.Container>
      <Toolbar />
      <styles.CanvasContainer>
        <Canvas />
      </styles.CanvasContainer>
    </styles.Container>
  );
};
