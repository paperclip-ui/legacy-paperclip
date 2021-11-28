import { StringifySheetOptions } from "paperclip-utils";
import { InterimImport } from "..";

export type InterimCompilerOptions = {
  css?: (url: string) => StringifySheetOptions
};
export type ModuleContext = {
  filePath: string;
  options: InterimCompilerOptions;
  componentNames: string[];
  imports: InterimImport[];
  scopeIds: string[];
};
