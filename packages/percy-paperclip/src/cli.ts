// Inspiration: https://github.com/percy/cli/blob/43a608c1f49e0e65cc78e00a55a9506c45173da5/packages/cli-upload/src/commands/upload.js
// https://github.com/percy/cli/blob/43a608c1f49e0e65cc78e00a55a9506c45173da5/packages/cli-upload/src/resources.js
import PercyClient from "@percy/client";
import * as chalk from "chalk";
import * as mime from "mime";
import * as fs from "fs";
import {
  createEngineDelegate,
  VirtualNodeKind,
  VirtualStyleElement,
  EngineMode
} from "paperclip";
import { eachFrame } from "paperclip-diff-utils";
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
  options: Partial<RunOptions> = {}
) => {
  const { cwd } = options;
  const engine = await createEngineDelegate({
    mode: EngineMode.MultiFrame
  });

  const client = new PercyClient({
    token: process.env.PERCY_TOKEN
  });

  const buildId = (await client.createBuild()).data.id;
  const limit = pLimit(MAX_CONCURRENT);

  await await eachFrame(
    sourceDirectory,
    options,
    async (html, annotations, snapshotName, assetPaths) => {
      const resources = [
        {
          url: "/",
          root: true,
          mimetype: "text/html",
          sha: createHash("sha256")
            .update(html, "utf-8")
            .digest("hex"),
          content: html
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

      return limit(async () => {
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
      });
    }
  );

  console.info(`Waiting for build to finalize...`);
  await client.finalizeBuild(buildId);
  console.info(`Done!`);
};
