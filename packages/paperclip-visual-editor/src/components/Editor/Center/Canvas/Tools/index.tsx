import React, { useState } from "react";
import { Box, Point, findIntersectingBox } from "../../../../../state";
import { useAppStore } from "../../../../../hooks/useAppStore";

import * as styles from "./index.pc";
import { Selectable } from "./Selectable";
import { getScaledPoint } from "../../../../../state";
import { Pixels } from "./Pixels";

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
      {/* <Pixels canvasTransform={canvas.transform} /> */}
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
