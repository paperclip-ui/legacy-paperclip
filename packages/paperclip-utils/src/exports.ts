export type PCExports = {
  components: Record<string, ComponentExport>;
  style: {
    mixins: Record<string, MixinExport>;
    classNames: Record<string, ClassNameExport>;
    variables: Record<string, VariableExport>;
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
