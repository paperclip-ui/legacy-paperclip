import PercyAgent from "@percy/agent";
import * as glob from "glob";
import * as path from "path";
import * as chalk from "chalk";
import * as url from "url";
import { XMLHttpRequest } from "w3c-xmlhttprequest";
import domTransformation from "./dom-transformation";
import {
  Engine,
  createEngine,
  VirtualFragment,
  VirtualNodeKind,
  paperclipSourceGlobPattern,
  VirtualStyleElement
} from "paperclip";
import { PCDocument } from "./pc-document";

export type RunOptions = {
  cwd: string;
  keepEmpty?: boolean;
};

const EMPTY_CONTENT_STATE = `<html><head></head><body></body></html>`;

export const run = async (
  sourceDirectory: string,
  { cwd = process.cwd(), keepEmpty }: Partial<RunOptions> = {}
) => {
  const paperclipFilePaths = glob.sync(
    paperclipSourceGlobPattern(sourceDirectory),
    { cwd, absolute: true }
  );

  const engine = await createEngine();
  const agent = new PercyAgent({
    xhr: XMLHttpRequest,
    domTransformation
  });

  // wait for the agent to do a quick health check (needed so that the agent doesn't display "not connected" error)
  await new Promise(resolve => {
    setTimeout(resolve, 1000);
  });

  for (const filePath of paperclipFilePaths) {
    const relativePath = path.relative(cwd, filePath);
    let result;

    try {
      result = await engine.run(url.pathToFileURL(filePath).href);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
    const { sheet, importedSheets, preview } = result;

    const root: VirtualFragment = {
      children: [
        ...importedSheets.map(({ sheet }) => createStyle(sheet)),
        createStyle(sheet),
        preview
      ],
      kind: VirtualNodeKind.Fragment
    };

    const document = new PCDocument("http://" + relativePath, root) as any;

    if (!keepEmpty && isEmpty(document.outerHTML)) {
      console.info(`[${chalk.yellow("ppclp")}] skip empty: '${relativePath}'`);
      continue;
    }

    agent.snapshot(relativePath, {
      document
    });
  }
};

const isEmpty = (source: string) => {
  return (
    source.replace(/[\r\n\s\t]+/g, "").replace(/<style>.*?<\/style>/g, "") ===
    EMPTY_CONTENT_STATE
  );
};

const createStyle = (sheet: any): VirtualStyleElement => {
  return {
    sheet,
    kind: VirtualNodeKind.StyleElement
  };
};
