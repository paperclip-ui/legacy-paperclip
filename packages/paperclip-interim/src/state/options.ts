import { PaperclipConfig } from "@paperclip-ui/core";
import { CompilerOptions } from "@paperclip-ui/utils";
import { InterimModule } from ".";

export type CompileOptions = {
  module: InterimModule;
  fileUrl: string;
  includes: string[];
  config: PaperclipConfig;
  targetOptions: CompilerOptions;
  cwd: string;
};

export type TargetCompiler = (
  options: CompileOptions
) => Record<string, string>;
