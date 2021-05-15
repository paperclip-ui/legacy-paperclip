import * as path from "path";
import * as https from "https";
import * as fs from "fs";
import * as chalk from "chalk";
import * as crypto from "crypto";
import { PaperclipOpenDesignConfig } from "./base";

export const CONFIG_FILE_NAME = "paperclip-open-design.config.json";

export const resolveConfigPath = (cwd: string) => {
  return path.join(cwd, CONFIG_FILE_NAME);
};

export const readConfig = (
  cwd: string,
  defaultConfig: PaperclipOpenDesignConfig
): PaperclipOpenDesignConfig => {
  const filePath = resolveConfigPath(cwd);
  return fs.existsSync(filePath) ? readJSON(filePath) : defaultConfig;
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

export const httpGet = (options: https.RequestOptions): Promise<any> => {
  return new Promise((resolve, reject) => {
    https.get(options, res => {
      let buffer = "";

      res.on("data", chunk => (buffer += String(chunk)));
      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(buffer);
            resolve(result);
          } catch (e) {
            resolve(buffer);
          }
        } else {
          try {
            reject(JSON.parse(buffer));
          } catch (e) {
            reject(buffer);
          }
        }
      });
    });
  });
};
