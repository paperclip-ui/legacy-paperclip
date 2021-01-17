import React from "react";
import * as styles from "./index.pc";
import { Canvas } from "../../../../../../state";

type Props = {
  canvas: Canvas;
};

const MIN_ZOOM = 5;

export const Pixels = ({
  canvas: {
    transform: { z, x, y },
    size: { width, height },
  },
}: Props) => {
  if (z < MIN_ZOOM) {
    return null;
  }
  const strokeWidth = 1;
  const gridSize = 1 * z;

  const ox = 1 - Math.abs(Math.round(x) % gridSize);
  const oy = Math.abs(Math.round(y) % gridSize);
  return (
    <styles.Pixels
      style={{
        backgroundPosition: `${ox}px ${oy}px`,
        transformOrigin: `top left`,
        backgroundImage: `url("data:image/svg+xml;utf8,<svg width='${gridSize}px' height='${gridSize}px' xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='${gridSize}' x2='${gridSize}' y2='${gridSize}' style='stroke: black; stroke-width: ${strokeWidth}px;' /><line x1='${gridSize}' y1='0' x2='${gridSize}' y2='${gridSize}' style='stroke: black; stroke-width: ${strokeWidth}px;' /></svg>")`,
        backgroundSize: `${gridSize}px`,
      }}
    />
  );
};
