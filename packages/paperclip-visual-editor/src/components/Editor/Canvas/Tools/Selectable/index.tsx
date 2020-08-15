import React from "react";
import { IntersectingBox, Transform } from "../../../../../state";
import * as styles from "./index.pc";
import { Dispatch } from "redux";
import { Action, canvasElementClicked } from "../../../../../actions";
import { transform } from "lodash";

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
            "--zoom": canvasTransform.z,
            left: intersectingRect.box.x,
            top: intersectingRect.box.y,
            width: intersectingRect.box.width,
            height: intersectingRect.box.height,
            transformOrigin: `top left`
          }}
        />
      </>
    );
  }
);
