import * as fs from "fs";
import * as url from "url";
import { VirtualFragment, stringifyVirtualNode } from "paperclip";

export class PCDocument {
  styleSheets = [];
  documentElement;
  URL;
  constructor(
    readonly root: VirtualFragment,
    private _serializeFilePath: (value: string) => string
  ) {
    this.documentElement = this;

    // surpress percy warn
    this.URL = "http://127.0.0.1/";
  }
  get outerHTML() {
    // Need to embed local assets, otherwise they'll show up as broken images.
    return embedAssets(
      `<html><head><meta charset="utf-8"></head><body><style>body { margin: 0px; padding: 0px }</style>${stringifyVirtualNode(
        this.root
      )}</body></html>`,
      this._serializeFilePath
    );
  }
  querySelectorAll() {
    return [];
  }
  cloneNode() {
    return this;
  }
}

const embedAssets = (
  source: string,
  serializeFilePath: (value: string) => string
) => {
  let newSource = source;
  const re = `([\\('"])(file://.*?)([\\)'"])`;
  const global = new RegExp(re, "g");
  const local = new RegExp(re);
  const matches = source.match(global) || [];

  for (const match of matches) {
    const [, , uri] = match.match(local);

    // shouldn't happen, but just in case
    try {
      const pathname = url.fileURLToPath(uri);
      if (fs.existsSync(pathname)) {
        const newUrl = serializeFilePath(pathname);
        newSource = newSource.replace(uri, newUrl);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return newSource;
};
