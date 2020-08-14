export type CompilerOptions = {
  name: string;
  module?: "es6" | "commonjs";
  [identifier: string]: any;
};

export type PaperclipConfig = {
  outputDirectory?: string;

  // drops PC extension, so you're left with *.js instead of *.pc.js
  dropPcExtension?: boolean;

  sourceDirectory: string;

  compilerOptions: CompilerOptions;

  moduleDirectories?: string[];
};
