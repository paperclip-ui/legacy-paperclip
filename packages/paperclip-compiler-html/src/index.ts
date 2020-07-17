import { ClassNameExport } from "paperclip-utils";

type Options = {};

export const compile = (
  info: { ast: Node; sheet?: any; classNames: Record<string, ClassNameExport> },
  filePath: string,
  options: Options = {}
) => {};
