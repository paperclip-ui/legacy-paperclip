import React, { useLayoutEffect, useRef, useState } from "react";
import {
  Frame,
  FramesRenderer,
  getFrameBounds,
  getFrameVirtualNode
} from "paperclip-web-renderer";
import { memo, useEffect, useMemo } from "react";
import {
  engineDelegateEventsHandled,
  rectsCaptured,
  rendererMounted,
  rendererUnounted
} from "../../../../../actions";
import { useAppStore } from "../../../../../hooks/useAppStore";
import {
  computeVirtJSValue,
  computeVirtJSObject,
  VirtualElement,
  VirtualNode,
  VirtualText,
  NodeAnnotations
} from "paperclip-utils";
import * as styles from "./index.pc";
import { render } from "react-dom";
import { FrameContainer } from "../../../../FrameContainer";

type FramesProps = {
  expandedFrameIndex?: number;
};

export const Frames = memo(({ expandedFrameIndex }: FramesProps) => {
  const { state } = useAppStore();
  const { renderer, preview, onFrameLoaded } = useFrames({
    fileUri: state.currentFileUri,
    shouldCollectRects: true
  });

  return (
    <>
      {renderer.immutableFrames.map((frame, i) => {
        return (
          <Frame
            key={i}
            onLoad={onFrameLoaded}
            expanded={expandedFrameIndex === i}
            frame={frame}
            preview={getFrameVirtualNode(
              frame,
              renderer.immutableFrames,
              preview
            )}
          />
        );
      })}
    </>
  );
});

type UseFramesProps = {
  fileUri: string;
  shouldCollectRects: boolean;
};

export const useFrames = ({
  fileUri,
  shouldCollectRects = true
}: UseFramesProps) => {
  const { state, dispatch } = useAppStore();
  const [id, setId] = useState<string>();

  const frameData = state.allLoadedPCFileData[fileUri];

  const renderer = useMemo(() => {
    const id = String(`${Date.now()}.${Math.random()}`);
    setId(id);
    const renderer = new FramesRenderer(fileUri, state.renderProtocol);
    if (frameData) {
      renderer.initialize(frameData);
    }
    return renderer;
  }, [dispatch, fileUri, state.renderProtocol, !!frameData]);

  useEffect(() => {
    dispatch(rendererMounted({ id }));
    return () => {
      dispatch(rendererUnounted({ id }));
    };
  }, [id]);

  const collectRects = useMemo(() => {
    if (!shouldCollectRects) {
      //eslint-disable-next-line
      return () => {};
    }
    let running;

    return () => {
      if (running) {
        return;
      }
      running = true;

      // needs slight delay to capture
      setTimeout(() => {
        running = false;
        dispatch(rectsCaptured(renderer.getRects()));
      }, 5);
    };
  }, [renderer, shouldCollectRects]);

  useLayoutEffect(() => {
    if (renderer && frameData?.preview) {
      renderer.setPreview(frameData.preview);
      collectRects();
    }
  }, [renderer, frameData, state.expandedFrameInfo, state.canvas.size]);

  const onFrameLoaded = collectRects;

  useEffect(() => {
    if (state.currentEngineEvents[id]?.length) {
      state.currentEngineEvents[id]?.forEach(
        renderer.handleEngineDelegateEvent
      );
      collectRects();
      dispatch(
        engineDelegateEventsHandled({
          id,
          count: state.currentEngineEvents[id].length
        })
      );
    }
  }, [id, collectRects, renderer, state.currentEngineEvents]);

  return { renderer, preview: frameData?.preview, onFrameLoaded };
};

type FrameProps = {
  frame: Frame;
  expanded: boolean;
  preview: VirtualText | VirtualElement;
  onLoad: () => void;
};

const Frame = memo(({ frame, preview, expanded, onLoad }: FrameProps) => {
  if (!preview) {
    return null;
  }

  const annotations: NodeAnnotations =
    (preview.annotations && computeVirtJSObject(preview.annotations)) ||
    ({} as any);

  // ability to hide
  if (annotations.frame?.visible === false) {
    return null;
  }

  const frameStyle = useMemo(() => {
    const bounds = getFrameBounds(preview);

    if (expanded) {
      return {
        width: `100%`,
        height: `100%`,

        // necessary since client rects include frame position
        left: bounds.x,
        top: bounds.y,
        zIndex: 1,
        position: "absolute"
      };
    }

    return {
      width: bounds.width,
      height: bounds.height,
      left: bounds.x,
      top: bounds.y,
      position: "absolute"
    };
  }, [preview.annotations, expanded]) as any;

  return (
    <styles.Frame style={frameStyle}>
      <FrameContainer frame={frame} onLoad={onLoad} />
    </styles.Frame>
  );
});
