import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import * as styles from "./index.pc";

declare const TARGET_URI;
declare const PROTOCOL;

export const Preview = React.memo(() => {
  const { state } = useAppStore();
  const mountRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (state.rendererElement && mountRef.current) {
      mountRef.current.appendChild(state.rendererElement);
    }
  }, [mountRef, state.rendererElement]);

  return <styles.Preview ref={mountRef} />;
});
