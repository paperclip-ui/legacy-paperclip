import React, { useRef, useState, useEffect } from "react";
import * as styles from "./index.pc";
import { Preview } from "./Preview/style=";
import { Tools } from "./Tools";
import { useAppStore } from "../../../hooks/useAppStore";
import { canvasPanEnd, canvasPanned, canvasPanStart } from "../../../actions";

export const Canvas = React.memo(() => {
  const {
    state: {
      canvas: { transform }
    },
    dispatch
  } = useAppStore();

  const [canvasPanTimer, setCanvasPanTimer] = useState<any>(0);

  const canvasRef = useRef<HTMLElement>();

  const onWheel = (event: React.WheelEvent<any>) => {
    clearTimeout(canvasPanTimer);
    if (!canvasRef.current) {
      return;
    }
    if (!canvasPanTimer) {
      dispatch(canvasPanStart(null));
    }
    const rect = canvasRef.current.getBoundingClientRect();
    dispatch(
      canvasPanned({
        delta: {
          x: event.deltaX,
          y: event.deltaY
        },
        mousePosition: {
          x: event.pageX,
          y: event.pageY
        },
        metaKey: event.metaKey,
        size: {
          width: rect.width,
          height: rect.height
        }
      })
    );
    setCanvasPanTimer(
      setTimeout(() => {
        setCanvasPanTimer(null);
        dispatch(canvasPanEnd(null));
      }, 100)
    );
  };

  return (
    <styles.Canvas ref={canvasRef} onWheel={onWheel}>
      <styles.Inner
        style={{
          transform: `translateX(${transform.x}px) translateY(${transform.y}px) scale(${transform.z})`,
          transformOrigin: "top left"
        }}
      >
        <Tools />
        <Preview />
      </styles.Inner>
    </styles.Canvas>
  );
});
