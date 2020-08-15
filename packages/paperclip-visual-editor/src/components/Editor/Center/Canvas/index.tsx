import React, { useRef, useState, useEffect } from "react";
import * as styles from "./index.pc";
import { Preview } from "./Preview";
import { Tools } from "./Tools";
import { useAppStore } from "../../../../hooks/useAppStore";
import {
  canvasPanEnd,
  canvasPanned,
  canvasPanStart,
  canvasResized,
  canvasMouseMoved
} from "../../../../actions";

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

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const onResize = () => {
      const { width, height } = canvasRef.current.getBoundingClientRect();
      dispatch(
        canvasResized({
          width,
          height
        })
      );
    };

    window.addEventListener("resize", onResize);

    setImmediate(onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [canvasRef]);

  const onMouseMove = (event: React.MouseEvent<any>) => {
    dispatch(
      canvasMouseMoved({
        x: event.pageX,
        y: event.pageY
      })
    );
  };

  return (
    <styles.Canvas ref={canvasRef} onWheel={onWheel} onMouseMove={onMouseMove}>
      <styles.Inner
        style={{
          transform: `translateX(${transform.x}px) translateY(${transform.y}px) scale(${transform.z}) translateZ(0)`,
          transformOrigin: "top left"
        }}
      >
        <Tools />
        <Preview />
      </styles.Inner>
    </styles.Canvas>
  );
});
