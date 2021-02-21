import { paperclipSourceGlobPattern } from "paperclip";
import { glob } from "glob";
import { PaperclipConfig } from "paperclip-utils";
import {webpack} from "webpack";
import { generateConfig } from "./generate-config";

export type BuildOptions = {
  config: PaperclipConfig
};

export const build = async ({ config }: BuildOptions) => {
  const files = await loadSourceFiles(config);
  await runWebpack(files);

};

const loadSourceFiles = (config: PaperclipConfig) => new Promise<string[]>((resolve, reject) => {
  glob(paperclipSourceGlobPattern(config.sourceDirectory), (err, results) => {
    resolve(results);
  });
});

const runWebpack = (pcFiles: string[]) => new Promise((resolve, reject) => {
  webpack(generateConfig(pcFiles), (err, stats) => {
    if (err) return reject(err);
    resolve(null);
  });
});