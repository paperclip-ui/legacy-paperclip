import { EngineDelegate } from "@paperclip-ui/core";
import { Document } from "./document";
import * as fsa from "fs-extra";
import { fileURLToPath } from "url";

/**
 */
export class InternalHost {
  /**
   */

  private _document: Record<string, Promise<Document>>;

  /**
   */

  constructor(private _engine: EngineDelegate) {}

  /**
   */

  openDocument(uri: URL) {
    return (
      this._document[uri.href] ||
      (this._document[uri.href] = new Promise(async (resolve, reject) => {
        const content = await fsa.readFile(fileURLToPath(uri.href), "utf-8");
        this._engine.open(uri.href);
        const document = new Document(uri, content, this._engine);
        // document.onChange(() => {

        // });
        resolve(document);
      }))
    );
  }
}
