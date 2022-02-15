// Inspiration: https://github.com/percy/cli/blob/43a608c1f49e0e65cc78e00a55a9506c45173da5/packages/cli-upload/src/commands/upload.js
// https://github.com/percy/cli/blob/43a608c1f49e0e65cc78e00a55a9506c45173da5/packages/cli-upload/src/resources.js

const globby = require("globby");
import * as path from "path";
import * as fs from "fs";
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
  computeVirtScriptObject,
  NodeAnnotations,
  EvaluatedDataKind,
} from "@paperclip-ui/core";
import { embedAssets, getPCDocumentHTML } from "./pc-document";
import { getPrettyMessageFromError } from "@paperclip-ui/cli-utils";
import * as crypto from "crypto";

export type RunOptions = {
  cwd: string;
  keepEmpty?: boolean;
  snapshotNameTemplate?: string;
  resolveAsset?: (filePath: string) => string;
};

const EMPTY_CONTENT_STATE = `<html><head></head><body></body></html>`;

export type EachFrameInfo = {
  id: string;
  filePath: string;
  html: string;
  annotations: NodeAnnotations;
  title: string;
  uniqueTitle: string;
  assets: Record<string, string>;
};

const defaultFilter = (filePaths: string[]) => Promise.resolve(filePaths);

export const eachFrame = async (
  sourceDirectory: string,
  {
    cwd = process.cwd(),
    keepEmpty,
    snapshotNameTemplate = "{frameFilePath}: {frameTitle}",
    resolveAsset,
  }: Partial<RunOptions> = {},
  each: (info: EachFrameInfo) => Promise<void>
) => {
  let paperclipFilePaths = await globby(
    paperclipSourceGlobPattern(sourceDirectory),
    {
      cwd,
      absolute: true,
      gitignore: true,
      ignore: ["**/node_modules/**"],
      followSymbolicLinks: true,
    }
  );

  const engine = await createEngineDelegate({
    mode: EngineMode.MultiFrame,
  });

  const promises: any = [];

  for (const filePath of paperclipFilePaths) {
    const relativePath = path.relative(cwd, filePath);
    let result: LoadedData;

    const uri = url.pathToFileURL(filePath).href;
    try {
      result = await engine.open(uri);
    } catch (e) {
      const inf = getPrettyMessageFromError(
        e,
        fs.readFileSync(filePath, "utf-8"),
        uri,
        cwd
      );
      console.error(inf || e);
      continue;
    }

    if (result.kind !== EvaluatedDataKind.PC) {
      continue;
    }

    const { sheet, importedSheets, preview } = result;

    const frames = (
      preview.kind === VirtualNodeKind.Fragment ? preview.children : [preview]
    ) as VirtualFrame[];

    const used: Record<string, number> = {};

    for (let i = 0, { length } = frames; i < length; i++) {
      const frame = frames[i];

      const annotations: NodeAnnotations =
        (frame.annotations && computeVirtScriptObject(frame.annotations)) || {};

      const root: VirtualFragment = {
        sourceId: null,
        id: null,
        children: [
          ...importedSheets.map(({ sheet }) => createStyle(sheet)),
          createStyle(sheet),
          frame,
        ],
        kind: VirtualNodeKind.Fragment,
      };

      let frameLabel = annotations.frame?.title || `Untitled`;

      let uniqueFramelabel = frameLabel;

      if (used[frameLabel]) {
        uniqueFramelabel = frameLabel + " " + used[frameLabel];
        used[frameLabel]++;
      } else {
        used[frameLabel] = 1;
      }

      const html = getPCDocumentHTML(root);
      const isDocEmpty = !keepEmpty && isEmpty(html);
      const shouldSkip = annotations.visualRegresionTest === false;

      const data = {
        frameFilePath: relativePath,
        frameTitle: uniqueFramelabel,
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

      const fixedHTML = embedAssets(
        html,
        resolveAsset ||
          ((filePath) => {
            return (assetPaths[filePath] = "/" + encodeURIComponent(filePath));
          })
      );

      promises.push(
        each({
          html: fixedHTML,
          annotations,
          title: uniqueFramelabel,
          uniqueTitle: snapshotName,
          assets: assetPaths,
          filePath,
          id: md5(snapshotName),
        })
      );
    }

    await Promise.all(promises);
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
    id: null,
    sourceId: null,
    sheet,
    kind: VirtualNodeKind.StyleElement,
  };
};

const md5 = (value: string) => {
  return crypto.createHash("md5").update(value).digest("hex");
};
