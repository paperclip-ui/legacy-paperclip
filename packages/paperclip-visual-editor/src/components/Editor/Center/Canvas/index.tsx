import React, { useRef, useState, useEffect } from "react";
import * as styles from "./index.pc";
import { Preview } from "./Preview";
import { Tools } from "./Tools";
import { useAppStore } from "../../../../hooks/useAppStore";
import { Frames } from "./Frames";
import {
  canvasPanEnd,
  canvasPanned,
  canvasPanStart,
  canvasResized
} from "../../../../actions";

export const Canvas = React.memo(() => {
  const { state, dispatch } = useAppStore();
  const {
    canvas: { transform },
    expandedFrameInfo
  } = state;

  const [canvasPanTimer, setCanvasPanTimer] = useState<any>(0);

  const canvasRef = useRef<HTMLElement>();

  const onWheel = (event: React.WheelEvent<any>) => {
    event.preventDefault();
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

  return (
    <styles.Canvas ref={canvasRef} onWheel={onWheel}>
      <styles.Inner
        style={{
          transform: `translateX(${transform.x}px) translateY(${transform.y}px) scale(${transform.z}) translateZ(0)`,
          transformOrigin: "top left",
          willChange: "transform"
        }}
      >
        <Frames expandedFrameIndex={expandedFrameInfo?.frameIndex} />
      </styles.Inner>
      <Tools />
    </styles.Canvas>
  );
});
