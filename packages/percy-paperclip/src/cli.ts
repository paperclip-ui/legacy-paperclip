import PercyAgent from "@percy/agent";
import * as glob from "glob";
import * as path from "path";
import * as chalk from "chalk";
import * as url from "url";
import { XMLHttpRequest } from "w3c-xmlhttprequest";
import domTransformation from "./dom-transformation";
import {
  createEngineDelegate,
  VirtualFragment,
  VirtualNodeKind,
  paperclipSourceGlobPattern,
  VirtualStyleElement,
  EngineMode,
  LoadedData,
  VirtualFrame,
  computeVirtJSObject,
  NodeAnnotations,
  EvaluatedDataKind
} from "paperclip";
import { PCDocument } from "./pc-document";
import { startStaticServer } from "./static-server";
import { timeout } from "./utils";

export type RunOptions = {
  cwd: string;
  keepEmpty?: boolean;
  skipHidden?: boolean;
  snapshotNameTemplate?: string;
};

const EMPTY_CONTENT_STATE = `<html><head></head><body></body></html>`;

// max size for frame
const MAX_FRAME_WIDTH = 2000;

export const run = async (
  sourceDirectory: string,
  {
    cwd = process.cwd(),
    keepEmpty,
    skipHidden = true,
    snapshotNameTemplate = "{frameFilePath}: {frameTitle}"
  }: Partial<RunOptions> = {}
) => {
  const paperclipFilePaths = glob.sync(
    paperclipSourceGlobPattern(sourceDirectory),
    { cwd, absolute: true }
  );

  const engine = await createEngineDelegate({
    mode: EngineMode.MultiFrame
  });
  const server = await startStaticServer();

  const agent = new PercyAgent({
    xhr: XMLHttpRequest,
    domTransformation
  });

  // // wait for the agent to do a quick health check (needed so that the agent doesn't display "not connected" error)
  await timeout(1000);

  for (const filePath of paperclipFilePaths) {
    const relativePath = path.relative(cwd, filePath);
    let result: LoadedData;

    try {
      result = await engine.open(url.pathToFileURL(filePath).href);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }

    if (result.kind !== EvaluatedDataKind.PC) {
      continue;
    }

    const { sheet, importedSheets, preview } = result;

    const frames = (preview.kind === VirtualNodeKind.Fragment
      ? preview.children
      : [preview]) as VirtualFrame[];

    for (let i = 0, { length } = frames; i < length; i++) {
      const frame = frames[i];

      const annotations: NodeAnnotations =
        (frame.annotations && computeVirtJSObject(frame.annotations)) || {};

      const root: VirtualFragment = {
        source: null,
        children: [
          ...importedSheets.map(({ sheet }) => createStyle(sheet)),
          createStyle(sheet),
          frame
        ],
        kind: VirtualNodeKind.Fragment
      };

      const document = new PCDocument(root, server.allowFile) as any;
      const frameLabel = annotations.frame?.title || `Untitled ${i}`;

      if (skipHidden && annotations.frame?.visible === false) {
        console.info(
          `[${chalk.blue(
            "ppclp"
          )}] skip hidden frame "${frameLabel}" - ${chalk.gray(relativePath)}`
        );
        continue;
      }

      if (!keepEmpty && isEmpty(document.outerHTML)) {
        console.info(
          `[${chalk.yellow(
            "ppclp"
          )}] skip empty frame "${frameLabel}" - ${chalk.gray(relativePath)}`
        );
        continue;
      }

      const data = {
        frameFilePath: relativePath,
        frameTitle: frameLabel
      };

      const snapshotName = snapshotNameTemplate.replace(
        /\{(.*?)\}/g,
        (cap, propName) => {
          return data[propName];
        }
      );

      agent.snapshot(snapshotName, {
        document,
        widths: annotations.frame?.width
          ? [Math.min(annotations.frame.width, MAX_FRAME_WIDTH)]
          : null
      });
    }
  }

  await server.finished();
  server.dispose();
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
    source: null,
    kind: VirtualNodeKind.StyleElement
  };
};
