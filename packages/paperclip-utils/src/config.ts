export type CompilerOptions = {
  name: string;
  [identifier: string]: any;
};

export type PaperclipConfig = {
  dropPcExtension?: boolean;
  filesGlob: string;
  moduleDirectories: string[];
  compilerOptions: CompilerOptions;
};
