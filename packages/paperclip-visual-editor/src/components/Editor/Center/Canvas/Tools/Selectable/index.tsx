import React, { useCallback } from "react";
import {
  BoxNodeInfo,
  Transform,
  Point,
  Box,
  roundBox
} from "../../../../../../state";
import * as styles from "./index.pc";
import { Dispatch } from "redux";
import {
  Action,
  canvasElementClicked,
  resizerMoved,
  resizerPathMoved,
  resizerPathStoppedMoving,
  resizerStoppedMoving
} from "../../../../../../actions";
import { startDOMDrag } from "../../../../../../utils";

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

    intersectingRect.box;

    const onKnobMouseDown = useCallback(
      (event: React.MouseEvent<any>, point: Point) => {
        event.stopPropagation();
        const bounds = intersectingRect.box;
        const zoom = canvasTransform.z;

        const wrapActionCreator = createAction => (event, info) => {
          const delta = {
            x: info.delta.x / zoom,
            y: info.delta.y / zoom
          };
          dispatch(
            createAction({
              originalBounds: roundBox(bounds),
              newBounds: roundBox({
                x: point.x === 0 ? bounds.x + delta.x : bounds.x,
                y: point.y === 0 ? bounds.y + delta.y : bounds.y,
                width:
                  point.x === 100
                    ? bounds.width + delta.x
                    : point.x == 50
                    ? bounds.width
                    : bounds.width - delta.x,
                height:
                  point.y === 100
                    ? bounds.height + delta.y
                    : point.y === 50
                    ? bounds.height
                    : bounds.height - delta.y
              }),
              anchor: point,
              sourceEvent: event
            })
          );
        };

        startDOMDrag(
          event,
          null,
          wrapActionCreator(resizerPathMoved),
          wrapActionCreator(resizerPathStoppedMoving)
        );
      },
      [intersectingRect, canvasTransform]
    );

    const onMouseDown = useCallback(
      event => {
        if (knobs) {
          const bounds = intersectingRect.box;
          const zoom = canvasTransform.z;

          const wrapActionCreator = createAction => (event, info) => {
            const delta = {
              x: info.delta.x / zoom,
              y: info.delta.y / zoom
            };
            dispatch(
              createAction({
                originalBounds: roundBox(bounds),
                newBounds: roundBox({
                  ...bounds,
                  x: bounds.x + delta.x,
                  y: bounds.y + delta.y
                }),
                sourceEvent: event
              })
            );
          };

          startDOMDrag(
            event,
            null,
            wrapActionCreator(resizerMoved),
            wrapActionCreator(resizerStoppedMoving)
          );
        }
      },
      [knobs, intersectingRect, canvasTransform]
    );

    return (
      <>
        <styles.Overlay
          onClick={onClick}
          onMouseDown={onMouseDown}
          size={`${Math.round(intersectingRect.box.width)}x${Math.round(
            intersectingRect.box.height
          )}`}
          knobs={
            knobs && (
              <>
                {knobs.map(({ x, y }) => {
                  return (
                    <styles.Knob
                      onMouseDown={event => {
                        onKnobMouseDown(event, { x, y });
                      }}
                      key={`${x}-${y}`}
                      x={x}
                      y={y}
                    />
                  );
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
