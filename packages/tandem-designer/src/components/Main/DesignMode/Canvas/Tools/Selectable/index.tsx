import React, { useCallback, useEffect, useState } from "react";
import {
  BoxNodeInfo,
  Transform,
  Point,
  Box,
  roundBox,
  getScaledPoint,
} from "../../../../../../state";
import * as styles from "./index.pc";
import { Dispatch } from "redux";
import {
  Action,
  resizerMoved,
  resizerPathMoved,
  resizerPathStoppedMoving,
  resizerStoppedMoving,
} from "../../../../../../actions";
import { startDOMDrag } from "../../../../../../utils";
import { isEqual } from "lodash";

type Props = {
  canvasScroll: Point;
  box: Box;
  canvasTransform: Transform;
  dispatch: Dispatch<Action>;
  showKnobs?: boolean;
};

// https://github.com/crcn/tandem/blob/10.0.0/packages/dashboard/src/components/root/workspace/editors/paperclip/stage/canvas/tools-layer/selection/resizer.tsx

export const Selectable = React.memo(
  ({ box, canvasTransform, canvasScroll, showKnobs, dispatch }: Props) => {
    const [currentBox, setCurrentBox] = useState(box);
    const [initialBox, setInitialBox] = useState(box);

    useEffect(() => {
      if (!isEqual(initialBox, box)) {
        setCurrentBox(box);
        setInitialBox(box);
      }
    }, [box]);

    if (!currentBox) {
      return null;
    }

    const left =
      (currentBox.x - canvasScroll.x) * canvasTransform.z + canvasTransform.x;
    const top =
      (currentBox.y - canvasScroll.y) * canvasTransform.z + canvasTransform.y;

    let knobs: Point[] | null = null;

    if (showKnobs && currentBox) {
      knobs = [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 100, y: 100 },
        { x: 50, y: 100 },
        { x: 0, y: 100 },
        { x: 0, y: 50 },
      ];
    }

    const onKnobMouseDown = (event: React.MouseEvent<any>, point: Point) => {
      event.stopPropagation();
      const bounds = currentBox;
      const zoom = canvasTransform.z;

      // need to keep track of this internal state since it doesn't get
      // refreshed outside of this function because DND handlers here.
      let _currentBox = currentBox;

      const wrapActionCreator = (createAction) => (event, info) => {
        const delta = {
          x: info.delta.x / zoom,
          y: info.delta.y / zoom,
        };

        // prevent parent containers from event like mouse click
        // which would deselect multi-selected elements
        event.stopPropagation();

        let x = point.x === 0 ? bounds.x + delta.x : bounds.x;
        let y = point.y === 0 ? bounds.y + delta.y : bounds.y;

        // make sure sizes don't go into negative values
        const width = Math.max(
          1,
          point.x === 100
            ? bounds.width + delta.x
            : point.x == 50
            ? bounds.width
            : bounds.width - delta.x
        );

        const height = Math.max(
          1,
          point.y === 100
            ? bounds.height + delta.y
            : point.y === 50
            ? bounds.height
            : bounds.height - delta.y
        );

        // if params don't change, then make sure that the box doesn't move
        if (width == _currentBox.width) {
          x = _currentBox.x;
        }

        if (height == _currentBox.height) {
          y = _currentBox.y;
        }

        const newBounds = (_currentBox = roundBox({
          x,
          y,
          width,
          height,
        }));

        setCurrentBox(newBounds);

        dispatch(
          createAction({
            originalBounds: roundBox(bounds),
            newBounds,
            anchor: point,
            sourceEvent: event,
          })
        );
      };

      startDOMDrag(
        event,
        null,
        wrapActionCreator(resizerPathMoved),
        wrapActionCreator(resizerPathStoppedMoving)
      );
    };

    const onMouseDown = (event) => {
      if (knobs) {
        const bounds = currentBox;
        const zoom = canvasTransform.z;

        const wrapActionCreator = (createAction) => (event, info) => {
          const delta = {
            x: info.delta.x / zoom,
            y: info.delta.y / zoom,
          };
          event.stopPropagation();
          const newBounds = roundBox({
            ...bounds,
            x: bounds.x + delta.x,
            y: bounds.y + delta.y,
          });
          setCurrentBox(newBounds);
          dispatch(
            createAction({
              originalBounds: roundBox(bounds),
              newBounds,
              sourceEvent: event,
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
    };

    return (
      <>
        <styles.Overlay
          onMouseDown={onMouseDown}
          size={`${Math.round(currentBox.width)} x ${Math.round(
            currentBox.height
          )}`}
          knobs={
            knobs && (
              <>
                {knobs.map(({ x, y }) => {
                  return (
                    <styles.Knob
                      onMouseDown={(event) => {
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
            width: currentBox.width * canvasTransform.z,
            height: currentBox.height * canvasTransform.z,
            transformOrigin: `top left`,
          }}
        />
      </>
    );
  }
);
