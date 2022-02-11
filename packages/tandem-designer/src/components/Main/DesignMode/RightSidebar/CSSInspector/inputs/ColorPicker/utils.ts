import { memoize } from "@paperclip-ui/utils";

const CHANGE_THROTTLE_MS = 1000 / 20;

type RGBA = [number, number, number, number];
type HSLA = [number, number, number, number];

export const stringifyRgba = ([r, g, b, a]: RGBA) =>
  `rgba(${r}, ${g}, ${b}, ${a})`;

export const hslDrawer = memoize(
  (h: number) =>
    (canvas: HTMLCanvasElement, width: number = 100, height: number = 100) => {
      const hv = h * 360;
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;

      for (let row = 0; row <= height; row++) {
        let grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(
          1,
          `hsl(${hv}, 0%, ${((height - row) / height) * 100}%)`
        );
        grad.addColorStop(
          0,
          `hsl(${hv}, 100%, ${((height - row) / height) * 50}%)`
        );
        ctx.fillStyle = grad;
        ctx.fillRect(0, row, width, 1);
      }
    }
);

export const hslPointer = (hsl: HSLA, width: number, height: number) => {
  const [h, s, v] = hslToHsv(hsl);
  return {
    left: width * (1 - s),
    top: height * (1 - v),
  };
};

export const opacityPointer = (
  [h, s, l, a]: HSLA,
  width: number,
  height: number
) => {
  return {
    left: width * a,
  };
};

export const huePointer = ([h]: HSLA, width: number, height: number) => {
  return {
    left: (width * (h * 360)) / 360,
  };
};

export const hueDrawer = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) => {
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  for (let row = 0; row <= width; row++) {
    ctx.fillStyle = `hsl(${((row - width) / width) * 360}, 100%, 50%)`;
    ctx.fillRect(row, 0, 1, height);
  }
};

const opacityDrawer = memoize(
  (h: number) => (canvas: HTMLCanvasElement, width: number, height: number) => {
    let ctx = canvas.getContext("2d");
    const hv = h * 360;
    canvas.width = width;
    canvas.height = height;
    for (let row = 0; row <= width; row++) {
      ctx.fillStyle = `hsl(${hv}, 100%, ${((width - row) / width) * 50 + 50}%)`;
      ctx.fillRect(row, 0, 1, height);
    }
  }
);

export const updateOpacity = (rgba: RGBA, [h, s, l]: HSLA) => {
  const l2 = rgbaToHsla(rgba)[2];
  return [h, s, l, lToA(l2)];
};

const lToA = (l) =>
  Number((1 - Math.min(0.5, Math.max(0, l - 0.5)) / 0.5).toFixed(2));

export const updateHue = (rgba: RGBA, [, s, l, a]: HSLA) => [
  rgbaToHsla(rgba)[0],
  s,
  l,
  a,
];
export const updateHSLA = (rgba: RGBA, [h, , , a]: HSLA) => {
  const [, s, l] = rgbaToHsla(rgba);
  return [h, s, l, a];
};

export const rgbaToHsla = ([r, g, b, a]: RGBA) => {
  (r /= 255), (g /= 255), (b /= 255);
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l, a];
};

export const hueToRgb = (p, q, t) => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};

export const hslaToRgba = ([h, s, l, a]: HSLA): RGBA => {
  let r, g, b;

  if (s == 0) {
    r = g = b = l;
  } else {
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
};

export const rgbToHsv = ([r, g, b]: RGBA) => {
  (r /= 255), (g /= 255), (b /= 255);

  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h, s, v];
};

export const hslToHsv = (hsl: HSLA) => rgbToHsv(hslaToRgba(hsl));

export const parseRGBA = memoize((value: string): RGBA => {
  if (value.indexOf("rgba") !== -1) {
    return ((value.match(/[\d\.]+/g) as any) || [0, 0, 0, 1]).map(Number) as [
      number,
      number,
      number,
      number
    ];
  }
  let result =
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value) ||
    /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(value);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        1,
      ]
    : [0, 0, 0, 1];
});
