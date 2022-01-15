import { isPaperclipFile } from "@paperclip-ui/core";
import { Connection } from "../../core/connection";
import { EditorClientOptions } from "../client";
import { PCDocument } from "./pc";

export { PCDocument };

export type Document = PCDocument;

export const createDocument = (
  uri: string,
  connection: Connection,
  options: EditorClientOptions
): Document => {
  if (isPaperclipFile(uri)) {
    return new PCDocument(uri, connection, options);
  }

  // need to handle text plain, binary files, images

  throw new Error(`Don't know how to open ${uri}`);

  return null;
};
