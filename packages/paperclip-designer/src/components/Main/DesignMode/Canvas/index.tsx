import React, { useRef, useState, useEffect, useMemo } from "react";
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
import {
  getActiveFrameIndex,
  getFrameFromIndex,
  isExpanded
} from "../../../../state";
import { getFrameBounds } from "paperclip-web-renderer";
import { request } from "express";

export const Canvas = React.memo(() => {
  const { state, dispatch } = useAppStore();
  const {
    designer: {
      canvas: { transform }
    }
  } = state;

  const expanded = isExpanded(state.designer);

  const actualTransform = useMemo(() => {
    if (expanded) {
      const frame = getFrameFromIndex(
        getActiveFrameIndex(state.designer),
        state.designer
      );
      if (!frame) {
        return transform;
      }
      const frameBounds = frame && getFrameBounds(frame);
      return {
        x: -frameBounds.x,
        y: -frameBounds.y,
        z: 1
      };
    } else {
      return transform;
    }
  }, [transform, expanded]);

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
          x: event.pageX - rect.left,
          y: event.pageY - rect.top
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

    return false;
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

    requestAnimationFrame(onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [canvasRef]);


  return (
    <styles.Canvas ref={canvasRef} onWheel={onWheel}>
      <styles.Inner
        style={{
          transform: `translateX(${actualTransform.x}px) translateY(${actualTransform.y}px) scale(${actualTransform.z}) translateZ(0)`,
          transformOrigin: "top left",
          willChange: "transform"
        }}
      >
        <Frames
          expandedFrameIndex={
            expanded ? getActiveFrameIndex(state.designer) : null
          }
        />
      </styles.Inner>
      <Tools />
    </styles.Canvas>
  );
});