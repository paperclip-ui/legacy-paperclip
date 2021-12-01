import { PaperclipConfig, StringifySheetOptions } from "paperclip-utils";
import { InterimImport } from "..";

export type InterimCompilerOptions = {
  config: PaperclipConfig;
};

export type ModuleContext = {
  filePath: string;
  options: InterimCompilerOptions;
  componentNames: string[];
  imports: InterimImport[];
  scopeIds: string[];
};
