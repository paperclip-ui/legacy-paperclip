import { PaperclipConfig } from "paperclip";
import { CompilerOptions } from "@paperclipui/utils";
import { InterimModule } from ".";

export type CompileOptions = {
  module: InterimModule;
  fileUrl: string;
  includes: string[];
  config: PaperclipConfig;
  targetOptions: CompilerOptions;
  cwd: string;
};
