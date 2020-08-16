import React from "react";
import { IntersectingBox, Transform, Point } from "../../../../../../state";
import * as styles from "./index.pc";
import { Dispatch } from "redux";
import { Action, canvasElementClicked } from "../../../../../../actions";

type Props = {
  canvasScroll: Point;
  intersectingRect: IntersectingBox;
  canvasTransform: Transform;
  dispatch: Dispatch<Action>;
};

export const Selectable = React.memo(
  ({ intersectingRect, canvasTransform, canvasScroll, dispatch }: Props) => {
    if (!intersectingRect) {
      return null;
    }
    const onClick = (event: React.MouseEvent<any>) => {
      dispatch(
        canvasElementClicked({
          metaKey: event.metaKey,
          nodePath: intersectingRect.nodePath
        })
      );
    };

    return (
      <>
        <styles.Overlay
          onClick={onClick}
          size={`${Math.round(intersectingRect.box.width)}x${Math.round(
            intersectingRect.box.height
          )}`}
          style={{
            "--zoom": 1,
            left:
              (intersectingRect.box.x - canvasScroll.x) * canvasTransform.z +
              canvasTransform.x,
            top:
              (intersectingRect.box.y - canvasScroll.y) * canvasTransform.z +
              canvasTransform.y,
            width: intersectingRect.box.width * canvasTransform.z,
            height: intersectingRect.box.height * canvasTransform.z,
            transformOrigin: `top left`
          }}
        />
      </>
    );
  }
);
