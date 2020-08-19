import React, { useState, useRef } from "react";
import { Point, findBoxNodeInfo } from "../../../../../state";
import { useAppStore } from "../../../../../hooks/useAppStore";

import * as styles from "./index.pc";
import { Selectable } from "./Selectable";
import { getScaledPoint } from "../../../../../state";
import { Pixels } from "./Pixels";
import { Distance } from "./Distance";

export const Tools = () => {
  const {
    state: {
      boxes,
      canvas,
      toolsLayerEnabled,
      selectedNodePath,
      hoveringNodePath,
      metaKeyDown
    },
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

  const hoveringNodeInfo =
    mousePoint &&
    findBoxNodeInfo(
      getScaledPoint(mousePoint, canvas.transform, canvas.scrollPosition),
      boxes
    );

  return (
    <styles.Tools
      ref={toolsRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <Pixels canvas={canvas} />

      <Selectable
        dispatch={dispatch}
        canvasScroll={canvas.scrollPosition}
        canvasTransform={canvas.transform}
        intersectingRect={hoveringNodeInfo}
      />
      {selectedBox && (
        <Selectable
          dispatch={dispatch}
          canvasScroll={canvas.scrollPosition}
          canvasTransform={canvas.transform}
          intersectingRect={{ nodePath: selectedNodePath, box: selectedBox }}
        />
      )}
      {metaKeyDown && selectedBox && hoveringNodeInfo && (
        <Distance
          canvasScroll={canvas.scrollPosition}
          canvasTransform={canvas.transform}
          from={{ nodePath: selectedNodePath, box: selectedBox }}
          to={hoveringNodeInfo}
        />
      )}
    </styles.Tools>
  );
};
