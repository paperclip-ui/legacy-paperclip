import PercyClient from "@percy/client";
import * as glob from "glob";
import * as path from "path";
import * as chalk from "chalk";
import * as url from "url";
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
import { createHash } from "crypto";
import * as pLimit from "p-limit";

export type RunOptions = {
  cwd: string;
  keepEmpty?: boolean;
  skipHidden?: boolean;
  snapshotNameTemplate?: string;
};

const EMPTY_CONTENT_STATE = `<html><head></head><body></body></html>`;

// max size for frame
const MAX_FRAME_WIDTH = 2000;
const MAX_CONCURRENT = 10;

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

  const client = new PercyClient({
    token: process.env.PERCY_TOKEN
  });

  const buildId = (await client.createBuild()).data.id;
  const limit = pLimit(MAX_CONCURRENT);
  const snapshotPromises = [];

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
        children: [
          ...importedSheets.map(({ sheet }) => createStyle(sheet)),
          createStyle(sheet),
          frame
        ],
        kind: VirtualNodeKind.Fragment
      };

      const document = new PCDocument(root, server.allowFile);
      const frameLabel = annotations.frame?.title || `Untitled ${i}`;

      const isDocEmpty = !keepEmpty && isEmpty(document.outerHTML);
      const shouldSkip =
        (skipHidden && annotations.frame?.visible === false) ||
        annotations.visualRegresionTest === false ||
        isDocEmpty;

      const snapshotName = snapshotNameTemplate.replace(
        /\{(.*?)\}/g,
        (cap, propName) => {
          return data[propName];
        }
      );

      if (shouldSkip) {
        console.info(`skip ${snapshotName}`);
        continue;
      }

      const data = {
        frameFilePath: relativePath,
        frameTitle: frameLabel
      };

      snapshotPromises.push(
        limit(async () => {
          console.info(`snap ${snapshotName}`);

          try {
            await client.sendSnapshot(buildId, {
              name: snapshotName,
              widths: annotations.frame?.width
                ? [Math.min(annotations.frame.width, MAX_FRAME_WIDTH)]
                : null,
              resources: [
                {
                  root: true,
                  url: `http://localhost`,
                  mimetype: "text/html",
                  sha: createHash("sha256")
                    .update(document.outerHTML, "utf-8")
                    .digest("hex"),
                  content: document.outerHTML
                }
              ]
            });
          } catch (e) {
            console.error(chalk.red(e.stack));
          }
        })
      );
    }
  }

  await Promise.all(snapshotPromises);

  console.info(`Waiting for build to finalize...`);

  await client.finalizeBuild(buildId);
  console.info(`Done!`);
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
    kind: VirtualNodeKind.StyleElement
  };
};
