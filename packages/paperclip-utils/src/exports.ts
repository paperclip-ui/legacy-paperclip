export type PCExports = {
  components: string[];
  style: {
    mixins: Record<string, MixinExport>;
    classNames: Record<string, ClassNameExport>;
    variables: Record<string, VariableExport>;
  };
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
