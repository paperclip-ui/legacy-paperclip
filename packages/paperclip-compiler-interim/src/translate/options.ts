import { InterimImport } from "..";

export type interimCompilerOptions = {};
export type ModuleContext = {
  filePath: string;
  options: interimCompilerOptions;
  componentNames: string[];
  imports: InterimImport[];
  scopeIds: string[];
};
