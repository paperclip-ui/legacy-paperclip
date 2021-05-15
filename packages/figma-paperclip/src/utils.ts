import * as path from "path";
import * as fsa from "fs-extra";

import * as https from "https";
import * as fs from "fs";
import * as chalk from "chalk";
import * as crypto from "crypto";
export const CONFIG_FILE_NAME = "figma-paperclip.json";
export const COMMAND_NAME = "figma-paperclip";

export const readConfig = (cwd: string) => {
  return JSON.parse(fsa.readFileSync(getConfigPath(cwd), "utf8"));
};

export const getConfigPath = (cwd: string) => path.join(cwd, CONFIG_FILE_NAME);

export const configFileExists = (cwd: string) =>
  fsa.existsSync(getConfigPath(cwd));

export const logWarn = (message: string) => {
  console.warn(chalk.yellow(`warning`) + " " + message);
};

export const logInfo = (message: string) => {
  console.warn(chalk.blue(`info`) + " " + message);
};
export const logSuccess = (message: string) => {
  console.warn(chalk.green(`success`) + " " + message);
};

export const logError = (message: string) => {
  console.warn(chalk.red(`error`) + " " + message);
};

export const md5 = (value: string) => {
  return crypto
    .createHash("md5")
    .update(value)
    .digest("hex");
};
