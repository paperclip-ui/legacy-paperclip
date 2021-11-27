export type CSSExports = {
  classNames: string[];
  keyframes: string[];
};

export type InterimCSS = {
  sheetText: string;
  exports: CSSExports;

  // TODO
  sourceMaps?: any;
};
