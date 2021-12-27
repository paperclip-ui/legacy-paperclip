import { EngineDelegate } from "paperclip";
import {
  EngineDelegateChanged,
  PaperclipConfig,
  StringifySheetOptions
} from "paperclip-utils";
import { InterimImport } from "..";
import { InterimAsset } from "../state/assets";

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
  assets: InterimAsset[];
  componentNames: string[];
  imports: InterimImport[];
  scopeIds: string[];
};