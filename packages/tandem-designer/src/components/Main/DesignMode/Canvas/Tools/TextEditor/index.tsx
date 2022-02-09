import { VirtualNode, VirtualNodeKind } from "@paperclip-ui/utils";
import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { uiActions } from "../../../../../../actions";
import { Box, Point, Transform } from "../../../../../../state";

export type TextEditorProps = {
  box: Box;
  canvasScroll: Point;
  canvasTransform: Transform;
  node: VirtualNode;
};

export const TextEditor = ({
  box,
  canvasScroll,
  canvasTransform,
  node,
}: TextEditorProps) => {
  if (!box || !node || node.kind !== VirtualNodeKind.Text) {
    return null;
  }

  const left = (box.x - canvasScroll.x) * canvasTransform.z + canvasTransform.x;
  const top = (box.y - canvasScroll.y) * canvasTransform.z + canvasTransform.y;

  const ref = useRef<HTMLTextAreaElement>();
  const dispatch = useDispatch();

  const style: any = {
    position: "absolute",
    width: box.width,
    zIndex: 9999,
    height: box.height,
    left: box.x,
    top: box.y,

    "--zoom": 1,
    transform: `translateX(${left}px) translateY(${top}px) scale(${canvasTransform.z})`,
    // width: box.width * canvasTransform.z,
    // height: box.height * canvasTransform.z,
    transformOrigin: `top left`,
  };

  const onBlur = () => {
    dispatch(uiActions.canvasTextContentChanges({ value: ref.current.value }));
  };

  const onKeyPress = (event: React.KeyboardEvent<any>) => {
    if (event.key === "Enter") {
      dispatch(
        uiActions.canvasTextContentChanges({ value: ref.current.value })
      );
    }
  };

  return (
    <textarea
      style={style}
      ref={ref}
      autoFocus
      defaultValue={node.value.trim()}
      onBlur={onBlur}
      onKeyPress={onKeyPress}
    ></textarea>
  );
};
