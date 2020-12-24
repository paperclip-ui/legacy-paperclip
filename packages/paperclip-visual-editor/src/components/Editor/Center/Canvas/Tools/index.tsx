import React, { useState, useRef, useCallback } from "react";
import {
  Point,
  findBoxNodeInfo,
  mergeBoxes,
  getNodeInfoAtPoint
} from "../../../../../state";
import { useAppStore } from "../../../../../hooks/useAppStore";

import * as styles from "./index.pc";
import { Selectable } from "./Selectable";
import { getScaledPoint } from "../../../../../state";
import { Pixels } from "./Pixels";
import { Distance } from "./Distance";
import { Frames } from "./Frames";
import { VirtualFrame, VirtualNodeKind } from "paperclip-utils";
import {
  canvasMouseUp,
  canvasMouseLeave,
  canvasMouseMoved
} from "../../../../../actions";

export const Tools = () => {
  const {
    state: {
      boxes,
      canvas,
      toolsLayerEnabled,
      selectedNodePaths,
      currentFileUri,
      metaKeyDown,
      allLoadedPCFileData
    },
    dispatch
  } = useAppStore();
  const toolsRef = useRef<HTMLDivElement>();

  const onMouseMove = useCallback(
    (event: React.MouseEvent<any>) => {
      // offset toolbars
      const rect: ClientRect = (event.currentTarget as any).getBoundingClientRect();
      dispatch(
        canvasMouseMoved({
          x: event.pageX - rect.left,
          y: event.pageY - rect.top
        })
      );
    },
    [dispatch]
  );

  const onMouseUp = useCallback(
    (event: React.MouseEvent<any>) => {
      dispatch(
        canvasMouseUp({
          metaKey: event.metaKey,
          shiftKey: event.shiftKey
        })
      );
    },
    [dispatch]
  );

  const onMouseLeave = (event: React.MouseEvent<any>) => {
    dispatch(canvasMouseLeave(null));
  };
  const selectedBox =
    selectedNodePaths.length &&
    mergeBoxes(selectedNodePaths.map(path => boxes[path]));

  if (!toolsLayerEnabled) {
    return null;
  }

  const hoveringBox =
    canvas.mousePosition &&
    getNodeInfoAtPoint(canvas.mousePosition, canvas.transform, boxes)?.box;

  const virtualNode = allLoadedPCFileData[currentFileUri];

  if (!virtualNode) {
    return null;
  }

  const frames = (virtualNode.preview.kind === VirtualNodeKind.Fragment
    ? virtualNode.preview.children
    : [virtualNode.preview]) as Array<VirtualFrame>;

  return (
    <styles.Tools
      ref={toolsRef}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <Pixels canvas={canvas} />

      <Selectable
        dispatch={dispatch}
        canvasScroll={canvas.scrollPosition}
        canvasTransform={canvas.transform}
        box={hoveringBox}
      />
      {selectedBox ? (
        <Selectable
          dispatch={dispatch}
          canvasScroll={canvas.scrollPosition}
          canvasTransform={canvas.transform}
          box={selectedBox}
          showKnobs={selectedNodePaths.every(
            nodePath => !nodePath.includes(".")
          )}
        />
      ) : null}
      <Frames
        frames={frames}
        dispatch={dispatch}
        canvasTransform={canvas.transform}
      />
      {metaKeyDown && selectedBox && hoveringBox ? (
        <Distance
          canvasScroll={canvas.scrollPosition}
          canvasTransform={canvas.transform}
          from={selectedBox}
          to={hoveringBox}
        />
      ) : null}
    </styles.Tools>
  );
};
