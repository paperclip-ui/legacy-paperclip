import PercyAgent from "@percy/agent";
import * as glob from "glob";
import * as path from "path";
import { XMLHttpRequest } from "w3c-xmlhttprequest";
import domTransformation from "./dom-transformation";
import {
  Engine,
  VirtualFragment,
  VirtualNodeKind,
  stringifyCSSSheet,
  VirtualStyleElement,
  stringifyVirtualNode
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

  // wait for the agent to do a quick health check (needed so that the agent doesn't display "not connected" error)
  await new Promise(resolve => {
    setTimeout(resolve, 500);
  });

  for (const filePath of paperclipFilePaths) {
    const relativePath = path.relative(cwd, filePath);
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

    const document = new PCDocument("http://" + relativePath, root) as any;

    agent.snapshot(relativePath, {
      document
    });
  }
};

const createStyle = (sheet: any): VirtualStyleElement => {
  return {
    sheet,
    kind: VirtualNodeKind.StyleElement
  };
};
