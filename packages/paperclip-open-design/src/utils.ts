import * as path from "path";
import * as fs from "fs";
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
