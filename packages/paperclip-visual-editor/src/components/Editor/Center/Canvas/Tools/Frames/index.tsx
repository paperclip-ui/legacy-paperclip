import {
  NodeAnnotations,
  VirtualFrame,
  computeVirtJSObject,
  VirtualElement,
  VirtualNode,
  VirtualText
} from "paperclip-utils";
import { getFrameBounds } from "paperclip-web-renderer";
import React, { memo, useCallback } from "react";
import { Dispatch } from "redux";
import { Action, frameTitleClicked } from "../../../../../../actions";
import { Transform } from "../../../../../../state";
import * as styles from "./index.pc";

export type FramesProps = {
  frames: VirtualFrame[];
  dispatch: Dispatch<any>;
  canvasTransform: Transform;
};

export const Frames = memo(
  ({ frames, dispatch, canvasTransform }: FramesProps) => {
    return (
      <styles.FramesContainer>
        {frames.map((frame, i) => {
          return (
            <Frame
              key={i}
              frameIndex={i}
              dispatch={dispatch}
              frame={frame}
              canvasTransform={canvasTransform}
            />
          );
        })}
      </styles.FramesContainer>
    );
  }
);

type FrameProps = {
  frame: VirtualFrame;
  frameIndex: number;
  canvasTransform: Transform;
  dispatch: Dispatch<any>;
};

const Frame = memo(
  ({ frame, frameIndex, canvasTransform, dispatch }: FrameProps) => {
    const annotations: NodeAnnotations =
      (frame.annotations && computeVirtJSObject(frame.annotations)) || {};
    const frameBounds = getFrameBounds(frame as any);

    const onClick = useCallback(() => {
      dispatch(frameTitleClicked({ frameIndex }));
    }, []);

    return (
      <styles.Frame
        style={{
          left: 0,
          top: 0,
          width: frameBounds.width * canvasTransform.z,
          transform: `translateX(${canvasTransform.x +
            frameBounds.x *
              canvasTransform.z}px) translateY(${canvasTransform.y +
            frameBounds.y * canvasTransform.z}px) translateZ(0)`,
          transformOrigin: "top left"
        }}
      >
        <styles.FrameTitle onClick={onClick}>
          {annotations.frame?.title || "Untitled"}
        </styles.FrameTitle>
      </styles.Frame>
    );
  }
);
