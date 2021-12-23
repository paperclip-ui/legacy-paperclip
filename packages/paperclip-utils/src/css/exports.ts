export type CSSExports = {
  mixins: Record<string, MixinExport>;
  classNames: Record<string, ClassNameExport>;
  variables: Record<string, VariableExport>;
  keyframes: Record<string, KeyframesExport>;
};

export type ClassNameExport = {
  name: string;
  scopedName: string;
  public: boolean;
};

export type MixinExport = {
  // declarations: any;
  public: boolean;
};

export type VariableExport = {
  name: string;
  value: string;
  source: any;
};

export type KeyframesExport = {
  name: string;
  public: boolean;
  source: any;
};

export const isCSSExports = (exports: any): exports is CSSExports => {
  return exports.mixins != null;
};
