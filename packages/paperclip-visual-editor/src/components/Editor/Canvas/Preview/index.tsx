import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import * as styles from "./index.pc";
import { Transform } from "../../../../state";

declare const TARGET_URI;
declare const PROTOCOL;

type Props = {
  transform: Transform;
};

export const Preview = React.memo(({ transform }: Props) => {
  const { state } = useAppStore();
  const mountRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (state.rendererElement && mountRef.current) {
      mountRef.current.appendChild(state.rendererElement);
    }
  }, [mountRef, state.rendererElement]);

  console.log(
    `translateX(${transform.x}px) translateY(${transform.y}px) translateZ(${transform.z}px)`
  );

  return (
    <styles.Preview
      ref={mountRef}
      style={{
        transform: `translateX(${transform.x}px) translateY(${transform.y}px) scale(${transform.z})`,
        transformOrigin: "top left"
      }}
    />
  );
});
