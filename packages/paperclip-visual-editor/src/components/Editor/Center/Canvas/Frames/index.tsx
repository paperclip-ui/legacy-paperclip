import React, { useCallback, useRef } from "react";
import { Frame, FramesRenderer, getFrameBounds } from "paperclip-web-renderer";
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

export const Frames = memo(() => {
  const { renderer } = useFrames();

  return (
    <>
      {renderer.immutableFrames.map((frame, i) => {
        return (
          <Frame
            key={i}
            frame={frame}
            preview={renderer.getFrameVirtualNode(frame)}
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
    const renderer = new FramesRenderer(state.currentFileUri, "file://");
    if (frameData) {
      renderer.initialize(frameData);
    }
    return renderer;
  }, [state.currentFileUri, !!frameData]);

  const collectRects = useMemo(() => {
    let timer;

    return () => {
      // time for repaint
      clearTimeout(timer);
      timer = setTimeout(() => {
        dispatch(rectsCaptured(renderer.getRects()));
      }, 100);
    };
  }, [renderer]);

  useEffect(() => {
    if (state.currentEngineEvents.length) {
      state.currentEngineEvents.forEach(renderer.handleEngineDelegateEvent);
      collectRects();
      dispatch(engineDelegateEventsHandled(undefined));
    }
  }, [collectRects, renderer, state.currentEngineEvents]);

  return { renderer };
};

type FrameProps = {
  frame: Frame;
  preview: VirtualText | VirtualElement;
};

const Frame = memo(({ frame, preview }: FrameProps) => {
  const frameRef = useRef<HTMLDivElement>();

  const annotations: NodeAnnotations =
    (preview.annotations && computeVirtJSObject(preview.annotations)) ||
    ({} as any);

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
    return {
      width: bounds.width,
      height: bounds.height,
      left: bounds.x,
      top: bounds.y,
      position: "absolute"
    };
  }, [preview.annotations]) as any;

  return <styles.Frame style={frameStyle} ref={frameRef} />;
});
