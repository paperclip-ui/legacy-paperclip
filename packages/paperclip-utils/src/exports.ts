export type PCExports = {
  components: Record<string, ComponentExport>;
  style: {
    mixins: Record<string, MixinExport>;
    classNames: Record<string, ClassNameExport>;
    variables: Record<string, VariableExport>;
    keyframes: Record<string, KeyframesExport>;
  };
};

export type ComponentProperty = {
  name: string;
  optional: boolean;
};

export type ComponentExport = {
  name: string;
  properties: Record<string, ComponentProperty>;
  public: boolean;
};

export type ClassNameExport = {
  name: string;
  scopedName: string;
  public: boolean;
};

export type MixinExport = {
  declarations: any;
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
