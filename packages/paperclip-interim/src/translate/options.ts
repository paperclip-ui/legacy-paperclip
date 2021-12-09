import { EngineDelegate } from "paperclip";
import {
  EngineDelegateChanged,
  PaperclipConfig,
  StringifySheetOptions
} from "paperclip-utils";
import { InterimImport } from "..";

export type FIO = {
  readFile: (filePath: string) => Buffer;
  getFileSize: (filePath: string) => number;
};

export type InterimCompilerOptions = {
  cwd: string;
  config: PaperclipConfig;
  io?: FIO;
};

export type ModuleContext = {
  filePath: string;
  engine: EngineDelegate;
  options: InterimCompilerOptions;
  componentNames: string[];
  imports: InterimImport[];
  scopeIds: string[];
};
