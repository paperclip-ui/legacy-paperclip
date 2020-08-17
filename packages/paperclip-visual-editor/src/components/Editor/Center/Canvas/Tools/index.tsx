import React, { useState, useRef } from "react";
import { Point, findBoxNodeInfo } from "../../../../../state";
import { useAppStore } from "../../../../../hooks/useAppStore";

import * as styles from "./index.pc";
import { Selectable } from "./Selectable";
import { getScaledPoint } from "../../../../../state";
import { Pixels } from "./Pixels";
import { StatementKind } from "paperclip-utils";

export const Tools = () => {
  const {
    state: { boxes, canvas, toolsLayerEnabled, selectedNodePath },
    dispatch
  } = useAppStore();
  const [mousePoint, setMousePoint] = useState<Point>(null);
  const toolsRef = useRef<HTMLDivElement>();

  const onMouseMove = (event: React.MouseEvent<any>) => {
    // need to subtract topbar
    setMousePoint({ x: event.pageX, y: event.pageY - 22 });
  };

  const onMouseLeave = () => setMousePoint(null);
  const { panning } = canvas;
  const selectedBox = selectedNodePath && boxes[selectedNodePath];

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
      {!panning && (
        <Selectable
          dispatch={dispatch}
          canvasScroll={canvas.scrollPosition}
          canvasTransform={canvas.transform}
          intersectingRect={
            mousePoint &&
            findBoxNodeInfo(
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
      {!panning && selectedBox && (
        <Selectable
          dispatch={dispatch}
          canvasScroll={canvas.scrollPosition}
          canvasTransform={canvas.transform}
          intersectingRect={{ nodePath: selectedNodePath, box: selectedBox }}
        />
      )}
    </styles.Tools>
  );
};
