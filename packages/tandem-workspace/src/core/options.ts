export type ProjectOptions = {
  installDependencies?: boolean;
};

export type Options = {
  autoSave?: boolean;
  http?: {
    port: number;
  };

  // branch of project
  branch?: string;
  project?: ProjectOptions;
};
