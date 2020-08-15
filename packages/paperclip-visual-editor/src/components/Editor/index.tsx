import React from "react";
import { withAppStore } from "../../hocs";
import { Canvas } from "./Canvas";

export const Editor = withAppStore(() => {
  return <Canvas />;
});
