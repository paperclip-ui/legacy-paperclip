import * as path from "path";
import * as fsa from "fs-extra";

import * as https from "https";
import * as fs from "fs";
import * as chalk from "chalk";
import * as crypto from "crypto";
import { Config } from "./base";
import { camelCase } from "lodash";
export const CONFIG_FILE_NAME = "figma-paperclip.json";
export const COMMAND_NAME = "figma-paperclip";

export const readConfig = (cwd: string): Config => {
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

export const pascalCase = (value: string) =>
  value.charAt(0).toUpperCase() + camelCase(value.substr(1));

export const md5 = (value: string) => {
  return crypto
    .createHash("md5")
    .update(value)
    .digest("hex");
};

export type SourceUrlInfo = Partial<{
  fileKey?: string;
  projectId?: number;
  name?: string;
  teamId?: string;
}>;

export const extractSourceUrlInfo = (url: string): SourceUrlInfo => {
  const matches1 = url.match(
    /https:\/\/www.figma.com\/files\/(.*?)\/team\/(.*?)\//
  );
  let fileKey: string;
  let teamId: string;
  let name: string;
  let projectId: number;
  if (matches1) {
    // projectId = matches1[1];
    teamId = matches1[2];
  }
  const matches2 = url.match(
    /https:\/\/www.figma.com\/files\/(.*?)\/project\/(.*?)\/(.*?)/
  );
  if (matches2) {
    fileKey = matches2[2];
    name = matches2[3];
    // teamId = matches2[2];
  }

  const matches3 = url.match(
    /https:\/\/www.figma.com\/files\/project\/(.*?)\/(.*?)/
  );
  if (matches3) {
    projectId = Number(matches3[1]);
    name = matches3[2];
  }

  const matches4 = url.match(
    /https:\/\/www.figma.com\/file\/(.*?)\/([^\?\/]+)/
  );
  if (matches4) {
    fileKey = matches4[1];
    name = matches4[2];
  }

  const matches5 = url.match(
    /https\:\/\/www.figma.com\/files\/team\/(.*?)\/([^\?\/]+)/
  );

  if (matches5) {
    teamId = matches5[1];
    name = matches5[2];
  }

  return {
    fileKey,
    projectId,
    name,
    teamId
  };
};

export const findLayer = (layer: any, filter: (layer: any) => boolean) => {
  if (filter(layer)) {
    return layer;
  }
  if (layer.children) {
    for (const child of layer.children) {
      const found = findLayer(child, filter);
      if (found) return found;
    }
  }
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
