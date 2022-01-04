import * as chalk from "chalk";
import * as fsa from "fs-extra";
import * as path from "path";
import { Manifest } from "./state";
const PNG = require("pngjs").PNG;

export const MANIFEST_FILE_NAME = "manifest.json";
export const DIFF_BOUNDARY = "~";
export const PC_HIDDEN_DIR = ".paperclip";

export const logWarn = (message: string) => {
  console.warn(chalk.yellow(`[warn]`) + " " + message);
};

export const logInfo = (message: string) => {
  console.warn(chalk.blue(`[info]`) + " " + message);
};

export const logError = (message: string) => {
  console.warn(chalk.red(`[erro] `) + " " + message);
};
