import React from "react";
import * as styles from "./index.pc";
import { Transform } from "../../../../../../state";

type Props = {
  canvasTransform: Transform;
};

const MIN_ZOOM = 5;

export const Pixels = ({ canvasTransform: { z, x, y } }: Props) => {
  if (z < MIN_ZOOM) {
    return null;
  }
  const strokeWidth = 1 / z;

  return (
    <styles.Pixels
      style={{
        transform: `translateX(${-x / z}px) translateY(${-y /
          z}px) translateZ(0)`,
        transformOrigin: "top left",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg width='2px' height='2' xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='2' x2='4' y2='2' style='stroke: black; stroke-width: ${strokeWidth}px;' /><line x1='2' y1='0' x2='2' y2='4' style='stroke: black; stroke-width: ${strokeWidth}px;' /></svg>")`
      }}
    />
  );
};
