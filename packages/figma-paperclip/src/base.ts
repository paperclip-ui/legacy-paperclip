export type Config = {
  // project urls
  sources: string[];

  // pc files to include
  includes?: string[];

  outputDir: string;
};

export type OutputFile = {
  path: string;
  content: string;
};
