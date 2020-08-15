import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Point,
  findIntersectingBox,
  Transform
} from "../../../../../state";
import { useAppStore } from "../../../../../hooks/useAppStore";
type Props = {
  boxes: Record<string, Box>;
};
import * as styles from "./index.pc";
import { Selectable } from "./Selectable";
import { canvasPanned } from "../../../../../actions";
import { getScaledPoint } from "../../../../../state";

export const Tools = () => {
  const {
    state: { boxes, canvas },
    dispatch
  } = useAppStore();
  const [mousePoint, setMousePoint] = useState<Point>(null);

  const onMouseMove = (event: React.MouseEvent<any>) => {
    setMousePoint({ x: event.pageX, y: event.pageY });
  };

  const onMouseLeave = () => setMousePoint(null);
  const { panning } = canvas;

  return (
    <styles.Tools onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      {!panning && (
        <Selectable
          dispatch={dispatch}
          canvasTransform={canvas.transform}
          intersectingRect={
            mousePoint &&
            findIntersectingBox(
              getScaledPoint(mousePoint, canvas.transform),
              boxes
            )
          }
        />
      )}
    </styles.Tools>
  );
};
