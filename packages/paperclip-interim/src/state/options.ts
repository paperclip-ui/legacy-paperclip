import { PaperclipConfig } from "paperclip";
import { InterimModule } from ".";

export type CompileOptions = {
  module: InterimModule;
  fileUrl: string;
  includes: string[];
  config: PaperclipConfig;
  cwd: string;
};
