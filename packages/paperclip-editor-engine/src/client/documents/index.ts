import { isPaperclipFile } from "@paperclip-ui/core";
import { Connection } from "../../core/connection";
import { PCDocument } from "./pc";

export { PCDocument };

export type Document = PCDocument;

export const createDocument = (
  uri: string,
  connection: Connection
): Document => {
  if (isPaperclipFile(uri)) {
    return new PCDocument(uri, connection);
  }

  // need to handle text plain, binary files, images

  throw new Error(`Don't know how to open ${uri}`);

  return null;
};
