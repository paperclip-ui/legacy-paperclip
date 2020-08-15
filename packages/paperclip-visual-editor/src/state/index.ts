import produce from "immer";
import { isEqual } from "lodash";
import { memoize } from "../utils";
import { VirtualNode } from "paperclip-web-renderer/node_modules/paperclip-utils";

export type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export type IntersectingBox = {
  nodePath: string;
  box: Box;
};

export type AppState = {
  rendererElement?: any;
  virtualRootNode?: VirtualNode;
  boxes: Record<string, Box>;
  zoomLevel: number;
};

export const INITIAL_STATE: AppState = {
  boxes: {},
  zoomLevel: 1
};

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
