import * as React from "react";
import { Dispatch } from "redux";

import { roundBox, Box, Point } from "../../../../../../state";
import { startDOMDrag } from "../../../../../../utils";
import {
  resizerPathMoved,
  resizerPathStoppedMoving
} from "../../../../../../actions";

export type PathOuterProps = {
  points: Point[];
  zoom: number;
  pointRadius: number;
  strokeWidth: number;
  showPoints?: boolean;
  bounds: Box;
  dispatch: Dispatch<any>;
};

// padding prevents the SVG from getting cut off when transform is applied - particularly during zoom.
const PADDING = 10;

export class Path extends React.PureComponent<PathOuterProps> {
  onPointClick = (point: Point, event: React.MouseEvent<any>) => {
    const { bounds, dispatch, zoom } = this.props;
    event.stopPropagation();
    const sourceEvent = { ...event };

    const wrapActionCreator = createAction => (event, info) => {
      const delta = {
        left: info.delta.x / zoom,
        top: info.delta.y / zoom
      };
      dispatch(
        createAction(
          point,
          roundBox(bounds),
          roundBox({
            x: point.x === 0 ? bounds.x + delta.left : bounds.x,
            y: point.y === 0 ? bounds.y + delta.top : bounds.y,
            width: point.x === 1 ? bounds.width + delta.left : bounds.width,
            height: point.y === 1 ? bounds.height + delta.top : bounds.height
          }),
          event
        )
      );
    };

    const svac = wrapActionCreator(resizerPathStoppedMoving);
    startDOMDrag(
      event,
      null,
      wrapActionCreator(resizerPathMoved),
      (event, info) => {
        // beat click so that items aren't selected
        setTimeout(() => {
          svac(event, info);
        });
      }
    );
  };

  render() {
    const {
      bounds,
      points,
      zoom,
      pointRadius,
      strokeWidth,
      showPoints = true
    } = this.props;

    const { onPointClick } = this;

    const width = bounds.width;
    const height = bounds.height;
    const cr = pointRadius;
    const crz = cr / zoom;
    const cw = cr * 2;
    const cwz = cw / zoom;
    const w = width + PADDING + Math.max(cw, cwz);
    const h = height + PADDING + Math.max(cw, cwz);
    const p = 100;

    const style = {
      width: w,
      height: h,
      left: -PADDING / 2,
      top: -PADDING / 2,
      position: "relative"
    };

    return (
      <svg
        style={style as any}
        viewBox={[0, 0, w, h].join(" ")}
        className="resizer-path"
      >
        {showPoints !== false
          ? points.map((path, i) => (
              <rect
                onMouseDown={event => onPointClick(path, event)}
                className={`point-circle-${path.y * 100}-${path.x * 100}`}
                strokeWidth={0}
                stroke="black"
                fill="transparent"
                width={cwz}
                height={cwz}
                x={path.x * width + PADDING / 2}
                y={path.y * height + PADDING / 2}
                rx={0}
                ry={0}
                key={i}
              />
            ))
          : void 0}
      </svg>
    );
  }
}
