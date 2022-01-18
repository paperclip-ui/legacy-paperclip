import { RPCClientAdapter } from "@paperclip-ui/common";
import { isPaperclipFile } from "@paperclip-ui/utils";
import { EditorClientOptions } from "../client";
import { PCDocument } from "./pc";

export { PCDocument };

export type Document = PCDocument;

export const createDocument = (
  uri: string,
  connection: RPCClientAdapter,
  options: EditorClientOptions
): Document => {
  if (isPaperclipFile(uri)) {
    return new PCDocument(uri, connection, options);
  }

  // need to handle text plain, binary files, images

  throw new Error(`Don't know how to open ${uri}`);

  return null;
};
