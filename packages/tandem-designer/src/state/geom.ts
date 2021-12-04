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

export type Size = {
  width: number;
  height: number;
};

export type Transform = {
  x: number;
  y: number;
  z: number;
};

export const centerTransformZoom = (
  translate: Transform,
  bounds: Box,
  nz: number,
  point?: Point
): Transform => {
  const oz = translate.z;

  const zd = nz / oz;

  const v1w = bounds.width;
  const v1h = bounds.height;

  // center is based on the mouse position
  const v1px = point ? point.x / v1w : 0.5;
  const v1py = point ? point.y / v1h : 0.5;

  // calculate v1 center x & y
  const v1cx = v1w * v1px;
  const v1cy = v1h * v1py;

  // old screen width & height
  const v2ow = v1w * oz;
  const v2oh = v1h * oz;

  // old offset pane left
  const v2ox = translate.x;
  const v2oy = translate.y;

  // new width of view 2
  const v2nw = v1w * nz;
  const v2nh = v1h * nz;

  // get the offset px & py of view 2
  const v2px = (v1cx - v2ox) / v2ow;
  const v2py = (v1cy - v2oy) / v2oh;

  const left = v1w * v1px - v2nw * v2px;
  const top = v1h * v1py - v2nh * v2py;

  return {
    x: left,
    y: top,
    z: nz,
  };
};

export const getScaledPoint = (
  point: Point,
  transform: Transform,
  scroll: Point = { x: 0, y: 0 }
) => {
  return {
    x: (point.x - transform.x) / transform.z + scroll.x,
    y: (point.y - transform.y) / transform.z + scroll.y,
  };
};

export const addPoint = (point: Point, minus: Point) => {
  return {
    x: point.x + minus.x,
    y: point.y + minus.y,
  };
};

export const mapBox = (
  bounds: Box,
  map: (value: number, key?: string) => number
): Box => ({
  ...bounds,
  x: map(bounds.x, "left"),
  y: map(bounds.y, "right"),
  width: map(bounds.width, "width"),
  height: map(bounds.height, "height"),
});

export const roundBox = (bounds: Box) => mapBox(bounds, (v) => Math.round(v));

export const mergeBoxes = (boxes: Box[]) => {
  if (!boxes.length) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  if (boxes.length === 1) {
    return boxes[0];
  }

  return boxes.slice(1).reduce((entire, box) => {
    const left = entire.x;
    const right = entire.x + entire.width;
    const top = entire.y;
    const bottom = entire.y + entire.height;

    const left2 = box.x;
    const right2 = box.x + box.width;
    const top2 = box.y;
    const bottom2 = box.y + box.height;

    const left3 = Math.min(left, left2);
    const right3 = Math.max(right, right2);
    const top3 = Math.min(top, top2);
    const bottom3 = Math.max(bottom, bottom2);

    return {
      x: left3,
      y: top3,
      width: right3 - left3,
      height: bottom3 - top3,
    };
  }, boxes[0]);
};
