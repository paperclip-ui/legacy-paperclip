import React, { useCallback, useRef } from "react";
import {
  Frame,
  FramesRenderer,
  getFrameBounds,
  getFrameVirtualNode
} from "paperclip-web-renderer";
import { memo, useEffect, useMemo } from "react";
import {
  engineDelegateEventsHandled,
  rectsCaptured
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

declare const PROTOCOL: string;

type FramesProps = {
  expandedFrameIndex?: number;
};

export const Frames = memo(({ expandedFrameIndex }: FramesProps) => {
  const { renderer, preview } = useFrames();

  return (
    <>
      {renderer.immutableFrames.map((frame, i) => {
        return (
          <Frame
            key={i}
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

const useFrames = () => {
  const { state, dispatch } = useAppStore();

  const frameData = state.allLoadedPCFileData[state.currentFileUri];

  const renderer = useMemo(() => {
    const renderer = new FramesRenderer(
      state.currentFileUri,
      typeof PROTOCOL === "undefined" ? "http://" : PROTOCOL
    );
    if (frameData) {
      renderer.initialize(frameData);
    }
    return renderer;
  }, [dispatch, state.currentFileUri, !!frameData]);

  const collectRects = useMemo(() => {
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
  }, [renderer]);

  useEffect(() => {
    if (renderer && frameData?.preview) {
      renderer.setPreview(frameData.preview);
      collectRects();
    }
  }, [renderer, frameData, state.expandedFrameInfo, state.canvas.size]);

  useEffect(() => {
    if (state.currentEngineEvents.length) {
      state.currentEngineEvents.forEach(renderer.handleEngineDelegateEvent);
      collectRects();
      dispatch(engineDelegateEventsHandled(undefined));
    }
  }, [collectRects, renderer, state.currentEngineEvents]);

  return { renderer, preview: frameData?.preview };
};

type FrameProps = {
  frame: Frame;
  expanded: boolean;
  preview: VirtualText | VirtualElement;
};

const Frame = memo(({ frame, preview, expanded }: FrameProps) => {
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

  const frameRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (frameRef.current) {
      const iframe = document.createElement("iframe");
      // addresses https://github.com/crcn/paperclip/issues/310
      Object.assign(iframe.style, {
        border: "none",
        background: "white"
      });
      iframe.srcdoc = `
      <!doctype html>
      <html>
        <head>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
        </body>
      </html>
    `;

      iframe.onload = () => {
        iframe.contentDocument.body.appendChild(frame.stage);
      };
      frameRef.current.appendChild(iframe);
    }

    return () => {
      // remove iframe
      if (frameRef.current && frameRef.current.childElementCount) {
        frameRef.current.removeChild(frameRef.current.childNodes[0]);
      }
    };
  }, [frameRef, frame]);

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

  return <styles.Frame style={frameStyle} ref={frameRef} />;
});
