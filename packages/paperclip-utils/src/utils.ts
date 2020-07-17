export const stripFileProtocol = (filePath: string) =>
  filePath.replace("file://", "");

export const paperclipSourceGlobPattern = (dir: string) =>
  dir === "." ? "**/*.pc" : dir + "/**/*.pc";
