import * as url from "url";

export const stripFileProtocol = (filePath: string) =>
  filePath.includes("file://") ? url.fileURLToPath(filePath) : filePath;

export const paperclipSourceGlobPattern = (dir: string) =>
  dir === "." ? "**/*.pc" : dir + "/**/*.pc";

// TODO: we want to watch for CSS files here, but need to be
// cognizant of generated CSS files which may clobber the PC engine. THe fix here
// I think is to load GLOB data, _as well as_ resources loaded into the PC file.
export const paperclipResourceGlobPattern = (dir: string) =>
  dir === "." ? "**/*.{pc}" : dir + "/**/*.{pc}";

export const isGeneratedPaperclipFile = (filePath: string) => {
  return /\.(pc(.\w+)+|scoped.css)$/.test(filePath);
};

export const isPaperclipFile = (filePath: string) => /\.pc$/.test(filePath);
export const isPaperclipResourceFile = (filePath: string) =>
  (isCSSFile(filePath) || isPaperclipFile(filePath)) &&
  !isGeneratedPaperclipFile(filePath);
export const isCSSFile = (filePath: string) => /\.css$/.test(filePath);
export const getScopedCSSFilePath = (filePath: string) =>
  filePath.replace(/\.css$/, ".scoped.css");
