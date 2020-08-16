import React from "react";
import { IntersectingBox, Transform } from "../../../../../../state";
import * as styles from "./index.pc";
import { Dispatch } from "redux";
import { Action, canvasElementClicked } from "../../../../../../actions";

type Props = {
  intersectingRect: IntersectingBox;
  canvasTransform: Transform;
  dispatch: Dispatch<Action>;
};

export const Selectable = React.memo(
  ({ intersectingRect, canvasTransform, dispatch }: Props) => {
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
          style={{
            "--zoom": 1,
            left:
              intersectingRect.box.x * canvasTransform.z + canvasTransform.x,
            top: intersectingRect.box.y * canvasTransform.z + canvasTransform.y,
            width: intersectingRect.box.width * canvasTransform.z,
            height: intersectingRect.box.height * canvasTransform.z,
            transformOrigin: `top left`
          }}
        />
      </>
    );
  }
);
