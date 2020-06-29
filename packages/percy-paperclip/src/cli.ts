import PercyAgent from "@percy/agent";
import * as glob from "glob";
import { XMLHttpRequest } from "xmlhttprequest";
import domTransformation from "./dom-transformation";
import {
  Engine,
  VirtualFragment,
  VirtualNodeKind,
  stringifyCSSSheet,
  VirtualStyleElement
} from "paperclip";
import { PCDocument } from "./pc-document";

export type RunOptions = {
  cwd: string;
};

export const run = async (
  filePattern: string,
  { cwd = process.cwd() }: Partial<RunOptions> = {}
) => {
  const paperclipFilePaths = glob.sync(filePattern, { cwd, absolute: true });

  const engine = new Engine();
  const agent = new PercyAgent({
    xhr: XMLHttpRequest,
    domTransformation
  });

  for (const filePath of paperclipFilePaths) {
    const { sheet, importedSheets, preview } = await engine.load(
      "file://" + filePath
    );

    const root: VirtualFragment = {
      children: [
        ...Object.values(importedSheets).map(createStyle),
        createStyle(sheet),
        preview
      ],
      kind: VirtualNodeKind.Fragment
    };

    agent.snapshot(filePath, {
      document: new PCDocument(root) as any
    });
  }
};

const createStyle = (sheet: any): VirtualStyleElement => {
  return {
    sheet,
    kind: VirtualNodeKind.StyleElement
  };
};
