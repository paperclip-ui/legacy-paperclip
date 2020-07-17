export type CompilerOptions = {
  name: string;
  [identifier: string]: any;
};

export type PaperclipConfig = {
  // drops PC extension, so you're left with *.js instead of *.pc.js
  dropPcExtension?: boolean;

  sourceDirectory: string;

  compilerOptions: CompilerOptions;
};
