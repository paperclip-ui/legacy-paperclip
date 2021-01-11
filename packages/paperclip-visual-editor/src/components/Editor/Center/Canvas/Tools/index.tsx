import React, { useState, useRef, useCallback } from "react";
import {
  Point,
  findBoxNodeInfo,
  mergeBoxes,
  getNodeInfoAtPoint,
  isExpanded,
  getActiveFrameIndex
} from "../../../../../state";
import { useAppStore } from "../../../../../hooks/useAppStore";

import * as styles from "./index.pc";
import { Selectable } from "./Selectable";
import { getScaledPoint } from "../../../../../state";
import { Pixels } from "./Pixels";
import { Distance } from "./Distance";
import { Frames } from "./Frames";
import {
  computeVirtJSObject,
  NodeAnnotations,
  VirtualFrame,
  VirtualNodeKind
} from "paperclip-utils";
import {
  canvasMouseUp,
  canvasMouseLeave,
  canvasMouseMoved
} from "../../../../../actions";
import { Empty } from "./Empty";

export const Tools = () => {
  const { state, dispatch } = useAppStore();
  const {
    boxes,
    canvas,
    selectedNodePaths,
    currentFileUri,
    metaKeyDown,
    allLoadedPCFileData,
    readonly
  } = state;
  const toolsRef = useRef<HTMLDivElement>();
  const toolsLayerEnabled = !isExpanded(state);

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

  const hoveringBox =
    canvas.mousePosition &&
    getNodeInfoAtPoint(
      canvas.mousePosition,
      canvas.transform,
      boxes,
      getActiveFrameIndex(state)
    )?.box;

  const virtualNode = allLoadedPCFileData[currentFileUri];

  if (!virtualNode || !toolsLayerEnabled) {
    return null;
  }

  const frames = (virtualNode.preview.kind === VirtualNodeKind.Fragment
    ? virtualNode.preview.children
    : [virtualNode.preview]) as Array<VirtualFrame>;

  const showEmpty =
    frames.filter(frame => {
      const annotations: NodeAnnotations =
        (frame.annotations && computeVirtJSObject(frame.annotations)) ||
        ({} as any);

      return annotations.frame?.visible !== false;
    }).length === 0;

  return (
    <styles.Tools
      ref={toolsRef}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <Empty show={showEmpty} />

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
          showKnobs={
            selectedNodePaths.every(nodePath => !nodePath.includes(".")) &&
            !readonly
          }
        />
      ) : null}
      <Frames
        frames={frames}
        dispatch={dispatch}
        canvasTransform={canvas.transform}
        readonly={readonly}
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
