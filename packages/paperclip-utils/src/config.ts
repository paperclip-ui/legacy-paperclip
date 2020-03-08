export type CompilerOptions = {
  name: string;
  [identifier: string]: String;
};

export type PaperclipConfig = {
  filesGlob: string;
  moduleDirectories: string[];
  compilerOptions: CompilerOptions;
};
