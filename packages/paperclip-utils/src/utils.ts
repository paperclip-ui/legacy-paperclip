import * as url from "url";

export const stripFileProtocol = (filePath: string) =>
  filePath.includes("file://") ? url.fileURLToPath(filePath) : filePath;

export const paperclipSourceGlobPattern = (dir: string) =>
  dir === "." ? "**/*.pc" : dir + "/**/*.pc";

export const paperclipResourceGlobPattern = (dir: string) =>
  dir === "." ? "**/*.{pc,css}" : dir + "/**/*.{pc,css}";

export const isGeneratedPaperclipFile = (filePath: string) => {
  return /\.(pc(.\w+)+|scoped.css)$/.test(filePath);
};

export const isPaperclipFile = (filePath: string) => /\.pc$/.test(filePath);
export const isPaperclipResourceFile = (filePath: string) =>
  (isCSSFile(filePath) || isPaperclipFile(filePath)) &&
  !isGeneratedPaperclipFile(filePath);
export const isCSSFile = (filePath: string) => /\.css$/.test(filePath);
export const getScopedCSSFileName = (filePath: string) =>
  filePath.replace(/\.css$/, ".scoped.css");
