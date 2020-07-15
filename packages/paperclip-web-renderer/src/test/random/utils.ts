import { clamp } from "lodash";

const AZRANGE = 123 - 97;

export type Options = {
  minDepth: number;
  maxDepth: number;
  minWidth: number;
  maxWidth: number;
};

export type Context = {
  depth: number;
};

const A2Z = Array.from({ length: AZRANGE }).map((v, i) =>
  String.fromCharCode(i + 97)
);

export const randomChars = (
  min: number,
  max: number,
  range: number = AZRANGE
) => {
  const azOptions = A2Z.slice(0, range);
  return randomArray(min, max)
    .map(() => pickRandom(azOptions))
    .join("");
};
export const randomArray = (min: number, max: number) =>
  Array.from({ length: clamp(Math.round(Math.random() * max), min, max) });
export const pickRandom = (options: any[], weights?: any[]) => {
  if (!weights) {
    weights = Array.from({ length: options.length }).map(() => 1);
  }

  const weightedOptions = options.reduce((weightedOptions, option, index) => {
    return [
      ...weightedOptions,
      ...Array.from({ length: weights[index] }).map(() => {
        return option;
      })
    ];
  }, []);

  return weightedOptions[Math.floor(Math.random() * weightedOptions.length)];
};
