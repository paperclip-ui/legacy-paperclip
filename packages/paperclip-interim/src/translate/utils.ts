import { EngineDelegate } from "@paperclip-ui/core";
import { FIO } from "./options";

export const maybeEmbed = (
  fromPath: string,
  relPath: string,
  engine: EngineDelegate,
  maxSize: number,
  io: FIO
) => {
  const filePath = engine.resolveFile(fromPath, relPath);
  const fileSize = io.getFileSize(filePath);
  if (fileSize > maxSize) {
    return relPath;
  }
  return `EMBED`;
};
