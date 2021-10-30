export type CSSExports = {
  classNames: string[];
  keyframes: string[];
};

export type IntermCSS = {
  sheetText: string;
  exports: CSSExports;
};
