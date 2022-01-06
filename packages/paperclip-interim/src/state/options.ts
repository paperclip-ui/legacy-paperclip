import { PaperclipConfig } from "paperclip";
import { CompilerOptions } from "paperclip-utils";
import { InterimModule } from ".";

export type CompileOptions = {
  module: InterimModule;
  fileUrl: string;
  includes: string[];
  config: PaperclipConfig;
  targetOptions: CompilerOptions;
  cwd: string;
};
