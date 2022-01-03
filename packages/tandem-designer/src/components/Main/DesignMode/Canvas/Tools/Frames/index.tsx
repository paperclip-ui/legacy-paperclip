import {
  NodeAnnotations,
  VirtualFrame,
  computeVirtScriptObject,
  VirtualElement,
  VirtualNode,
  VirtualText
} from "paperclip-utils";
import { getFrameBounds } from "paperclip-web-renderer";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { Dispatch } from "redux";
import {
  Action,
  expandFrameButtonClicked,
  frameTitleChanged,
  frameTitleClicked,
  redirectRequest
} from "../../../../../../actions";
import { Transform, UIState } from "../../../../../../state";
import * as styles from "./index.pc";
import * as qs from "querystring";

export type FramesProps = {
  frames: VirtualFrame[];
  dispatch: Dispatch<any>;
  canvasTransform: Transform;
  readonly: boolean;
  ui: UIState;
};

export const Frames = memo(
  ({ frames, dispatch, canvasTransform, ui, readonly }: FramesProps) => {
    return (
      <>
        {frames.map((frame, i) => {
          return (
            <Frame
              key={i}
              frameIndex={i}
              ui={ui}
              dispatch={dispatch}
              frame={frame}
              canvasTransform={canvasTransform}
              readonly={readonly}
            />
          );
        })}
      </>
    );
  }
);

type FrameProps = {
  frame: VirtualFrame;
  frameIndex: number;
  canvasTransform: Transform;
  dispatch: Dispatch<any>;
  readonly: boolean;
  ui: UIState;
};

const Frame = memo(
  ({
    frame,
    frameIndex,
    canvasTransform,
    readonly,
    ui,
    dispatch
  }: FrameProps) => {
    const annotations: NodeAnnotations =
      (frame.annotations && computeVirtScriptObject(frame.annotations)) || {};
    if (annotations.frame?.visible === false) {
      return null;
    }
    const frameBounds = getFrameBounds(frame as any);
    const [editing, setEditing] = useState(false);

    const onClick = useCallback(
      (event: React.MouseEvent<any>) => {
        dispatch(
          frameTitleClicked({
            frameIndex: frameIndex,
            shiftKey: event.shiftKey
          })
        );

        // prevent canvas click event
        event.stopPropagation();
      },
      [dispatch]
    );
    const inputRef = useRef<HTMLInputElement>();

    const onDoubleClick = useCallback(() => {
      if (readonly) {
        return;
      }
      setEditing(true);
      setTimeout(() => {
        inputRef.current.select();
      }, 50);
    }, [inputRef, readonly, setEditing]);

    const onChanged = useCallback(() => {
      if (!editing) {
        return;
      }

      setEditing(false);
      dispatch(
        frameTitleChanged({ frameIndex, value: inputRef.current.value })
      );
    }, [editing, inputRef, frameIndex, setEditing]);
    const onBlur = onChanged;
    useEffect(() => {
      inputRef.current.value = annotations.frame?.title || "";
    }, [inputRef, annotations.frame?.title]);

    const onKeyPress = useCallback(
      (event: React.KeyboardEvent<any>) => {
        if (event.key === "Enter") {
          onChanged();
        }
      },
      [onChanged]
    );

    const onExpandButtonClick = useCallback(() => {
      dispatch(
        redirectRequest({
          query: {
            ...ui.query,
            frame: frameIndex,
            expanded: true
          }
        })
      );
    }, [dispatch, frameIndex, ui.query]);

    return (
      <styles.Frame
        style={{
          left: 0,
          top: 0,
          width: frameBounds.width * canvasTransform.z,
          height: "auto",
          transform: `translateX(${canvasTransform.x +
            frameBounds.x *
              canvasTransform.z}px) translateY(${canvasTransform.y +
            frameBounds.y * canvasTransform.z}px) translateZ(0)`,
          transformOrigin: "top left"
        }}
      >
        <styles.FrameTitle
          editing={editing}
          onBlur={onBlur}
          onKeyPress={onKeyPress}
          onDoubleClick={onDoubleClick}
          onExpandButtonClick={onExpandButtonClick}
          inputRef={inputRef}
          onMouseUp={onClick}
          value={annotations.frame?.title || "Untitled"}
        />
      </styles.Frame>
    );
  }
);
