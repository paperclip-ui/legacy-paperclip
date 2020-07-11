export type PCExports = {
  components: string[];
  style: {
    mixins: MixinExport[];
    classNames: string[];
    variables: VariableExport[];
  };
};

export type MixinExport = {
  declarations: any;
  public: boolean;
};

export type VariableExport = {
  name: string;
  root: boolean;
};
