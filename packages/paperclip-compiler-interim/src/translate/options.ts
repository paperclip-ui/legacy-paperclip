import { InterimImport } from "..";

export type InterimCompilerOptions = {};
export type ModuleContext = {
  filePath: string;
  options: InterimCompilerOptions;
  componentNames: string[];
  imports: InterimImport[];
  scopeIds: string[];
};
