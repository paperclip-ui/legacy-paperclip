import React, { useCallback, useRef } from "react";
import { Frame, FramesRenderer } from "paperclip-web-renderer";
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
    <styles.FramesContainer>
      {renderer.immutableFrames.map((frame, i) => {
        return (
          <Frame
            key={i}
            frame={frame}
            preview={renderer.getFrameVirtualNode(frame)}
          />
        );
      })}
    </styles.FramesContainer>
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
    if (annotations.frame) {
      return {
        width: annotations.frame.width,
        height: annotations.frame.height,
        left: annotations.frame.x,
        top: annotations.frame.y,
        position: "absolute"
      };
    } else {
      // TODO - need to store this somewhere else
      return {
        width: 400,
        height: 300
      };
    }
  }, [annotations.frame]) as any;

  return (
    <styles.Frame style={frameStyle}>
      <styles.FrameTitle>
        {annotations.frame?.title || "Untitled"}
      </styles.FrameTitle>
      <styles.FrameBody ref={frameRef} />
    </styles.Frame>
  );
});
