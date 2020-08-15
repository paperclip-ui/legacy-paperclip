import React from "react";
import { IntersectingBox } from "../../../../../state";
import * as styles from "./index.pc";
import { Dispatch } from "redux";
import { Action, canvasElementClicked } from "../../../../../actions";

type Props = {
  intersectingRect: IntersectingBox;
  dispatch: Dispatch<Action>;
};

export const Selectable = React.memo(
  ({ intersectingRect, dispatch }: Props) => {
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
            left: intersectingRect.box.x,
            top: intersectingRect.box.y,
            width: intersectingRect.box.width,
            height: intersectingRect.box.height
          }}
        />
      </>
    );
  }
);
