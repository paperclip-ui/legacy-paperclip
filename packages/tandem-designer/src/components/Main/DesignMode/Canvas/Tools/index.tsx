import React, { useRef, useCallback } from "react";
import {
  mergeBoxes,
  isExpanded,
  flattenFrameBoxes,
} from "../../../../../state";
import { useAppStore } from "../../../../../hooks/useAppStore";

import * as styles from "./index.pc";
import { Selectable } from "./Selectable";
import { Pixels } from "./Pixels";
import { Distance } from "./Distance";
import { Frames } from "./Frames";
import {
  LoadedPCData,
  VirtualFrame,
  VirtualNodeKind,
} from "@paperclip-ui/utils";
import {
  canvasMouseDown,
  canvasMouseLeave,
  canvasMouseMoved,
} from "../../../../../actions";
import { Empty } from "./Empty";
import { uiActions } from "../../../../../actions/ui-actions";
import { useDrop } from "react-dnd";
import { AvailableNode } from "@paperclip-ui/language-service";

export const Tools = () => {
  const {
    frames,
    onMouswDown,
    onMouseMove,
    onMouseLeave,
    toolsRef,
    isDraggingOver,
    showEmpty,
    resizerMoving,
    canvas,
    dispatch,
    selectedBox,
    state,
    readonly,
    hoveringBox,
    virtualNode,
    toolsLayerEnabled,
    selectedNodePaths,
    optionKeyDown,
  } = useTools();

  if (!virtualNode || !toolsLayerEnabled) {
    return null;
  }

  return (
    <styles.Tools
      ref={toolsRef}
      hover={isDraggingOver && !hoveringBox}
      onMouseDown={onMouswDown}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <Empty show={showEmpty} />

      <Pixels canvas={canvas} />

      {!resizerMoving && (
        <Selectable
          dispatch={dispatch}
          canvasScroll={canvas.scrollPosition}
          canvasTransform={canvas.transform}
          box={hoveringBox}
        />
      )}

      {selectedBox ? (
        <Selectable
          dispatch={dispatch}
          canvasScroll={canvas.scrollPosition}
          canvasTransform={canvas.transform}
          box={selectedBox}
          showKnobs={
            selectedNodePaths.every((nodePath) => !nodePath.includes(".")) &&
            !readonly
          }
        />
      ) : null}
      <Frames
        frames={frames}
        dispatch={dispatch}
        ui={state.designer.ui}
        canvasTransform={canvas.transform}
        readonly={readonly}
      />
      {optionKeyDown && selectedBox && hoveringBox ? (
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

const useTools = () => {
  const { state, dispatch } = useAppStore();
  const {
    designer: {
      frameBoxes,
      canvas,
      selectedNodePaths,
      resizerMoving,
      ui: {
        query: { canvasFile },
      },
      optionKeyDown,
      allLoadedPCFileData,
      readonly,
    },
  } = state;

  const toolsLayerEnabled = !isExpanded(state.designer);

  const getMousePoint = (event) => {
    const rect: ClientRect = (
      event.currentTarget as any
    ).getBoundingClientRect();
    return {
      x: event.pageX - rect.left,
      y: event.pageY - rect.top,
    };
  };

  const onMouseMove = useCallback(
    (event: React.MouseEvent<any>) => {
      dispatch(canvasMouseMoved(getMousePoint(event)));
    },
    [dispatch]
  );

  const [{ isDraggingOver }, toolsRef] = useDrop<AvailableNode, any, any>({
    accept: "insertableNode",
    hover(item, monitor) {
      dispatch(uiActions.toolLayerDragOver(monitor.getSourceClientOffset()));
    },
    drop(item, monitor) {
      dispatch(
        uiActions.toolLayerDrop({
          node: item,
          point: monitor.getSourceClientOffset(),
        })
      );
    },
    collect(monitor) {
      return {
        isDraggingOver: monitor.isOver(),
      };
    },
  });

  const onMouswDown = useCallback(
    (event: React.MouseEvent<any>) => {
      dispatch(
        canvasMouseDown({
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          timestamp: Date.now(),
        })
      );
    },
    [dispatch]
  );

  const onMouseLeave = () => {
    dispatch(canvasMouseLeave(null));
  };

  const boxes = flattenFrameBoxes(frameBoxes);

  const selectedBox =
    selectedNodePaths.length &&
    mergeBoxes(selectedNodePaths.map((path) => boxes[path]));

  const hoveringBox =
    state.designer.highlightNodePath && boxes[state.designer.highlightNodePath];

  const virtualNode = allLoadedPCFileData[canvasFile] as LoadedPCData;

  const frames = virtualNode
    ? ((virtualNode.preview.kind === VirtualNodeKind.Fragment
        ? virtualNode.preview.children
        : [virtualNode.preview]) as Array<VirtualFrame>)
    : [];

  const showEmpty = frames.length === 0;

  return {
    frames,
    resizerMoving,
    toolsRef,
    onMouswDown,
    onMouseMove,
    isDraggingOver,
    onMouseLeave,
    showEmpty,
    virtualNode,
    toolsLayerEnabled,
    canvas,
    dispatch,
    selectedBox,
    state,
    readonly,
    hoveringBox,
    selectedNodePaths,
    optionKeyDown,
  };
};
