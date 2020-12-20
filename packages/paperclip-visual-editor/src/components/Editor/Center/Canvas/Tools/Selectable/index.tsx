import React from "react";
import { BoxNodeInfo, Transform, Point, Box } from "../../../../../../state";
import * as styles from "./index.pc";
import { Dispatch } from "redux";
import { Action, canvasElementClicked } from "../../../../../../actions";

type Props = {
  canvasScroll: Point;
  intersectingRect: BoxNodeInfo;
  canvasTransform: Transform;
  dispatch: Dispatch<Action>;
  showKnobs?: boolean;
};

// https://github.com/crcn/tandem/blob/10.0.0/packages/front-end/src/components/root/workspace/editors/paperclip/stage/canvas/tools-layer/selection/resizer.tsx

export const Selectable = React.memo(
  ({
    intersectingRect,
    canvasTransform,
    canvasScroll,
    showKnobs,
    dispatch
  }: Props) => {
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

    const left =
      (intersectingRect.box.x - canvasScroll.x) * canvasTransform.z +
      canvasTransform.x;
    const top =
      (intersectingRect.box.y - canvasScroll.y) * canvasTransform.z +
      canvasTransform.y;

    let knobs: Point[] | null = null;

    if (
      showKnobs &&
      intersectingRect &&
      intersectingRect.nodePath.split(".").length === 1
    ) {
      knobs = [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 100, y: 100 },
        { x: 50, y: 100 },
        { x: 0, y: 100 },
        { x: 0, y: 50 }
      ];
    }

    return (
      <>
        <styles.Overlay
          onClick={onClick}
          size={`${Math.round(intersectingRect.box.width)}x${Math.round(
            intersectingRect.box.height
          )}`}
          knobs={
            knobs && (
              <>
                {knobs.map(({ x, y }) => {
                  return <styles.Knob key={`${x}-${y}`} x={x} y={y} />;
                })}
              </>
            )
          }
          style={{
            "--zoom": 1,
            transform: `translateX(${left}px) translateY(${top}px)`,
            width: intersectingRect.box.width * canvasTransform.z,
            height: intersectingRect.box.height * canvasTransform.z,
            transformOrigin: `top left`
          }}
        />
      </>
    );
  }
);
