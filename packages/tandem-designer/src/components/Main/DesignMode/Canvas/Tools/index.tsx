import React, { useRef, useCallback, useEffect } from "react";
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
  getNodeByPath,
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
import { TextEditor } from "./TextEditor";

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
    showTextEditor,
    state,
    readonly,
    hoveringBox,
    loadedData,
    toolsLayerEnabled,
    selectedNodePaths,
    optionKeyDown,
  } = useTools();

  if (!loadedData || !toolsLayerEnabled) {
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
      {showTextEditor && (
        <TextEditor
          box={selectedBox}
          canvasScroll={canvas.scrollPosition}
          canvasTransform={canvas.transform}
          node={getNodeByPath(selectedNodePaths[0], loadedData.preview)}
        />
      )}

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
      showTextEditor,
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

  const toolsRef = useRef<HTMLDivElement>();

  const [{ isDraggingOver }, dragRef] = useDrop<AvailableNode, any, any>(
    {
      accept: "insertableNode",
      hover(item, monitor) {
        const offset = monitor.getClientOffset();
        const rect = toolsRef.current.getBoundingClientRect();

        dispatch(
          uiActions.toolLayerDragOver({
            x: offset.x - rect.x,
            y: offset.y - rect.y,
          })
        );
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
    },
    [toolsRef.current]
  );

  useEffect(() => {
    if (toolsRef.current) {
      dragRef(toolsRef.current);
    }
  }, [toolsRef.current]);

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

  const loadedData = allLoadedPCFileData[canvasFile] as LoadedPCData;

  const frames = loadedData
    ? ((loadedData.preview.kind === VirtualNodeKind.Fragment
        ? loadedData.preview.children
        : [loadedData.preview]) as Array<VirtualFrame>)
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
    showTextEditor,
    loadedData,
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
