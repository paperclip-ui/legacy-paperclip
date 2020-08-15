import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "../../../../../hooks/useAppStore";
import * as styles from "./index.pc";
import { Transform } from "../../../../../state";

declare const TARGET_URI;
declare const PROTOCOL;

type Props = {};

export const Preview = React.memo(({}: Props) => {
  const { state } = useAppStore();
  const mountRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (state.rendererElement && mountRef.current) {
      mountRef.current.appendChild(state.rendererElement);
    }
  }, [mountRef, state.rendererElement]);

  return <styles.Preview ref={mountRef} />;
});
