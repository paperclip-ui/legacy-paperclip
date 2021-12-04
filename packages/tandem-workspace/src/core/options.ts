export type Options = {
  cwd: string;
  autoSave?: boolean;
  openInitial?: boolean;
  http: {
    port: number;
  };

  localResourceRoots?: string[];

  // project directory or repository url
  project?: string;

  // branch of project
  branch?: string;
};
