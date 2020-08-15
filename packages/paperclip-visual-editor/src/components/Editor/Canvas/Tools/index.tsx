import React, { useState, useEffect, useRef } from "react";
import { Box, Point, findIntersectingBox } from "../../../../state";
import { useAppStore } from "../../../../hooks/useAppStore";
type Props = {
  boxes: Record<string, Box>;
};
import * as styles from "./index.pc";
import { Selectable } from "./Selectable";
import { canvasPanned } from "../../../../actions";
export const Tools = () => {
  const {
    state: { boxes },
    dispatch
  } = useAppStore();
  const [mousePoint, setMousePoint] = useState<Point>(null);
  const canvasRef = useRef<HTMLElement>();

  const onMouseMove = (event: React.MouseEvent<any>) => {
    setMousePoint({ x: event.pageX, y: event.pageY });
  };

  const onWheel = (event: React.WheelEvent<any>) => {
    if (!canvasRef.current) {
      return;
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
  };

  const onMouseLeave = () => setMousePoint(null);

  return (
    <styles.Tools
      ref={canvasRef}
      onWheel={onWheel}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <Selectable
        dispatch={dispatch}
        intersectingRect={mousePoint && findIntersectingBox(mousePoint, boxes)}
      />
    </styles.Tools>
  );
};
