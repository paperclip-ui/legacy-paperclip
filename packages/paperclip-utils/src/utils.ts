export const stripFileProtocol = (filePath: string) =>
  filePath.replace("file://", "");
