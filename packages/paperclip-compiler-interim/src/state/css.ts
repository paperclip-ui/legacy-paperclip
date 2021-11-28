export type CSSExports = {
  classNames: Record<string, string>;
};

export type InterimCSS = {
  sheetText: string;
  exports: CSSExports;

  // TODO
  sourceMaps?: any;
};
