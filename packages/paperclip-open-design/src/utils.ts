import * as path from "path";
import * as fs from "fs";
import * as chalk from "chalk";
import * as crypto from "crypto";
import { PaperclipOpenDesignConfig } from "./base";

export const CONFIG_FILE_NAME = "paperclip-open-design.config.json";

export const resolveConfigPath = (cwd: string) => {
  return path.join(cwd, CONFIG_FILE_NAME);
};

export const readConfig = (cwd: string): PaperclipOpenDesignConfig => {
  return readJSON(resolveConfigPath(cwd));
};

export const readJSON = (path: string) =>
  JSON.parse(fs.readFileSync(path, "utf-8"));

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
