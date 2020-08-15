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
    z: nz
  };
};

export const getScaledPoint = (point: Point, transform: Transform) => {
  return {
    x: (point.x - transform.x) / transform.z,
    y: (point.y - transform.y) / transform.z
  };
};
