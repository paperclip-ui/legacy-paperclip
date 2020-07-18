import * as url from "url";

export const stripFileProtocol = (filePath: string) =>
  filePath.includes("file://") ? url.fileURLToPath(filePath) : filePath;

export const paperclipSourceGlobPattern = (dir: string) =>
  dir === "." ? "**/*.pc" : dir + "/**/*.pc";
