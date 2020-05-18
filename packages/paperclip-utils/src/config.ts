export type CompilerOptions = {
  name: string;
  [identifier: string]: String;
};

export type PaperclipConfig = {
  dropPcExtension?: boolean;
  filesGlob: string;
  moduleDirectories: string[];
  compilerOptions: CompilerOptions;
};
