import React, { useCallback, useLayoutEffect, useState } from "react";
import {
  Frame as Frame2,
  FramesRenderer,
  FramesRendererState,
  getFrameBounds,
  getFrameRects,
  getFrameVirtualNode
} from "@paperclip-ui/web-renderer";
import { memo, useEffect, useMemo } from "react";
import mime from "mime-types";
import {
  engineDelegateEventsHandled,
  rectsCaptured,
  rendererMounted,
  rendererUnounted
} from "../../../../../actions";
import { useAppStore } from "../../../../../hooks/useAppStore";
import {
  computeVirtScriptObject,
  VirtualElement,
  VirtualNode,
  VirtualText,
  NodeAnnotations,
  LoadedData,
  EngineDelegateEvent,
  LoadedPCData,
  VirtualNodeKind,
  VirtualFrame
} from "@paperclip-ui/utils";
import * as styles from "./index.pc";
import { render } from "react-dom";
import { FrameContainer } from "../../../../FrameContainer";
import { debounce, identity } from "lodash";
import {
  AppState,
  getActiveFrameIndex,
  isExpanded
} from "../../../../../state";
import { ImmutableStore } from "@paperclip-ui/common";
import { UrlResolver } from "@paperclip-ui/web-renderer/lib/native-renderer";
import { useFrameUrlResolver } from "../../../../../hooks/useFrameUrlResolver";
import { useDispatch, useSelector } from "react-redux";
import { Frame } from "./Frame";

type FramesProps = {
  expandedFrameIndex?: number;
};

export const Frames = memo(({ expandedFrameIndex }: FramesProps) => {
  const { state } = useAppStore();
  const { frames, onFrameLoaded, onFrameUpdated } = useFrames({
    shouldCollectRects: true
  });

  return (
    <>
      {frames.map((frame, i) => {
        return (
          <Frame
            key={i}
            onLoad={onFrameLoaded}
            onUpdate={onFrameUpdated}
            expanded={expandedFrameIndex === i}
            frameUri={state.designer.ui.query.canvasFile}
            frameIndex={i}
            preview={frame as VirtualFrame}
          />
        );
      })}
    </>
  );
});

type UseFramesProps = {
  shouldCollectRects: boolean;
};

const useFrames = ({ shouldCollectRects = true }: UseFramesProps) => {
  const state = useSelector(identity) as AppState;
  const dispatch = useDispatch();
  const pcData: LoadedPCData = state.designer.allLoadedPCFileData[
    state.designer.ui.query.canvasFile
  ] as LoadedPCData;

  const emitFrameRects = useCallback(
    (
      mount: HTMLElement,
      data: LoadedPCData,
      frameUri: string,
      frameIndex: number
    ) => {
      if (!shouldCollectRects) {
        return false;
      }
      const rects = getFrameRects(mount, data, frameIndex);
      dispatch(rectsCaptured(rects));
    },
    [dispatch, shouldCollectRects]
  );

  const onFrameUpdated = (
    mount: HTMLElement,
    data: LoadedPCData,
    frameUri: string,
    index: number
  ) => {
    emitFrameRects(mount, data, frameUri, index);
  };

  const onFrameLoaded = (
    mount: HTMLElement,
    data: LoadedPCData,
    frameUri: string,
    index: number
  ) => {
    emitFrameRects(mount, data, frameUri, index);
  };

  if (!pcData) {
    return { frames: [], onFrameLoaded };
  }

  const frames =
    pcData.preview.kind === VirtualNodeKind.Fragment
      ? pcData.preview.children
      : [pcData.preview];

  return { frames, onFrameLoaded, onFrameUpdated };
};
