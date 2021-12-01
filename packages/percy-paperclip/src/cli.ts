// Inspiration: https://github.com/percy/cli/blob/43a608c1f49e0e65cc78e00a55a9506c45173da5/packages/cli-upload/src/commands/upload.js
// https://github.com/percy/cli/blob/43a608c1f49e0e65cc78e00a55a9506c45173da5/packages/cli-upload/src/resources.js
import PercyClient from "@percy/client";
import * as glob from "glob";
import * as path from "path";
import * as chalk from "chalk";
import * as mime from "mime";
import * as url from "url";
import * as fs from "fs";
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
import {
  embedAssets,
  getPCDocumentHTML
} from "./pc-document";
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

      const frameLabel = annotations.frame?.title || `Untitled ${i}`;

      const html = getPCDocumentHTML(root);
      const isDocEmpty = !keepEmpty && isEmpty(html);
      const shouldSkip =
        (skipHidden && annotations.frame?.visible === false) ||
        annotations.visualRegresionTest === false ||
        isDocEmpty;

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

      if (shouldSkip) {
        console.info(`skip ${snapshotName}`);
        continue;
      }

      const assetPaths: Record<string, string> = {};

      const fixedHTML = embedAssets(html, filePath => {
        return (assetPaths[filePath] = "/" + encodeURIComponent(filePath));
      });

      const resources = [
        {
          url: "/",
          root: true,
          mimetype: "text/html",
          sha: createHash("sha256")
            .update(fixedHTML, "utf-8")
            .digest("hex"),
          content: fixedHTML
        },
        ...Object.keys(assetPaths)
          .map(filePath => {
            const url = assetPaths[filePath];
            const content = fs.readFileSync(filePath);
            const mimetype = mime.getType(filePath);
            return {
              url,
              sha: createHash("sha256")
                .update(fs.readFileSync(filePath))
                .digest("hex"),
              mimetype,
              content
            };
          })
          .filter(Boolean)
      ];

      snapshotPromises.push(
        limit(async () => {
          console.info(`snap ${snapshotName}`);

          try {
            await client.sendSnapshot(buildId, {
              name: snapshotName,
              widths: annotations.frame?.width
                ? [Math.min(annotations.frame.width, MAX_FRAME_WIDTH)]
                : null,
              resources
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
