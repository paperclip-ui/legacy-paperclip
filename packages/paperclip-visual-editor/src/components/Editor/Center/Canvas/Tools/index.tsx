import React, { useState, useRef } from "react";
import { Point, findIntersectingBox } from "../../../../../state";
import { useAppStore } from "../../../../../hooks/useAppStore";

import * as styles from "./index.pc";
import { Selectable } from "./Selectable";
import { getScaledPoint } from "../../../../../state";
import { Pixels } from "./Pixels";

export const Tools = () => {
  const {
    state: { boxes, canvas, toolsLayerEnabled },
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

  if (!toolsLayerEnabled) {
    return null;
  }

  return (
    <styles.Tools
      ref={toolsRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <Pixels canvas={canvas} />
      {toolsLayerEnabled && (
        <styles.Inner>
          {!panning && (
            <Selectable
              dispatch={dispatch}
              canvasScroll={canvas.scrollPosition}
              canvasTransform={canvas.transform}
              intersectingRect={
                mousePoint &&
                findIntersectingBox(
                  getScaledPoint(
                    mousePoint,
                    canvas.transform,
                    canvas.scrollPosition
                  ),
                  boxes
                )
              }
            />
          )}
        </styles.Inner>
      )}
    </styles.Tools>
  );
};
