import { IntermImport } from "..";

export type IntermediateCompilerOptions = {};
export type ModuleContext = {
  filePath: string;
  options: IntermediateCompilerOptions;
  componentNames: string[];
  imports: IntermImport[];
  scopeIds: string[];
};
