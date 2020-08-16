import React, { useState, useRef } from "react";
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
  const toolsRef = useRef<HTMLDivElement>();

  const onMouseMove = (event: React.MouseEvent<any>) => {
    const rect = toolsRef.current.getBoundingClientRect();

    // need to subtract topbar
    setMousePoint({ x: event.pageX, y: event.pageY - 22 });
  };

  const onMouseLeave = () => setMousePoint(null);
  const { panning } = canvas;

  return (
    <styles.Tools
      ref={toolsRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <Pixels canvas={canvas} />
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
