import produce from "immer";
import { isEqual } from "lodash";
import { memoize } from "../utils";
import { VirtualNode, EngineErrorEvent } from "paperclip-utils";
import { Transform, Box, Point, Size } from "./geom";
import * as os from "os";

export type Canvas = {
  showTools: boolean;
  panning: boolean;
  transform: Transform;
  size: Size;
  mousePosition: Point;
};

export type IntersectingBox = {
  nodePath: string;
  box: Box;
};

export type AppState = {
  currentError?: EngineErrorEvent;
  rendererElement?: any;
  canvas: Canvas;
  virtualRootNode?: VirtualNode;
  boxes: Record<string, Box>;
  zoomLevel: number;
};

export const INITIAL_STATE: AppState = {
  boxes: {},
  zoomLevel: 1,
  canvas: {
    panning: false,
    showTools: true,
    size: { width: 0, height: 0 },
    mousePosition: { x: 0, y: 0 },
    transform: {
      x: 0,
      y: 0,
      z: 1
    }
  }
};

export const IS_WINDOWS = os.platform() === "win32";

export const mergeBoxesFromClientRects = (
  boxes: Record<string, Box>,
  rects: Record<string, ClientRect>
) => {
  const newBoxes = {};
  for (const nodePath in rects) {
    const { left, top, width, height } = rects[nodePath];
    const newBox = { x: left, y: top, width, height };
    const existingBox = boxes[nodePath];
    newBoxes[nodePath] = isEqual(existingBox, newBox) ? existingBox : newBox;
  }
  return newBoxes;
};

export const boxIntersectsPoint = (box: Box, point: Point) => {
  return (
    box.x <= point.x &&
    box.y <= point.y &&
    box.x + box.width >= point.x &&
    box.y + box.height >= point.y
  );
};

export const findIntersectingBox = memoize(
  (point: Point, boxes: Record<string, Box>): IntersectingBox | null => {
    let bestIntersetingBox;
    let bestIntersetingNodePath;
    for (const nodePath in boxes) {
      const box = boxes[nodePath];
      if (boxIntersectsPoint(box, point)) {
        if (
          !bestIntersetingBox ||
          nodePath.length > bestIntersetingNodePath.length
        ) {
          bestIntersetingBox = box;
          bestIntersetingNodePath = nodePath;
        }
      }
    }

    if (!bestIntersetingBox) {
      return null;
    }

    return {
      nodePath: bestIntersetingNodePath,
      box: bestIntersetingBox
    };
  }
);

export * from "./geom";
