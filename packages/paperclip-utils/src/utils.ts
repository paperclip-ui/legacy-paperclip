import * as url from "url";

export const stripFileProtocol = (filePath: string) =>
  filePath.includes("file://") ? url.fileURLToPath(filePath) : filePath;

export const paperclipSourceGlobPattern = (dir: string) =>
  dir === "." ? "**/*.pc" : dir + "/**/*.pc";

export const paperclipResourceGlobPattern = (dir: string) =>
  dir === "." ? "**/*.{pc,css}" : dir + "/**/*.{pc,css}";

export const isPaperclipFile = (filePath: string) => /\.pc$/.test(filePath);
