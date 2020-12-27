import * as fs from "fs";
import { memoize } from "lodash";
import * as mime from "mime";
import * as url from "url";
import { VirtualFragment, stringifyVirtualNode } from "paperclip";

export class PCDocument {
  styleSheets = [];
  documentElement;
  URL;
  constructor(readonly root: VirtualFragment) {
    this.documentElement = this;

    // surpress percy warn
    this.URL = "http://127.0.0.1/";
  }
  get outerHTML() {
    // Need to embed local assets, otherwise they'll show up as broken images.
    return embedAssets(
      `<html><head></head><body><style>body { margin: 0px; padding: 0px }</style>${stringifyVirtualNode(
        this.root
      )}</body></html>`.replace(/className/g, "class")
    );
  }
  querySelectorAll() {
    return [];
  }
  cloneNode() {
    return this;
  }
}

const embedAssets = memoize((source: string) => {
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
        const body = fs.readFileSync(pathname, "base64");
        const contentType = mime.getType(pathname);

        const src = `data:${contentType};base64,${body}`;

        newSource = newSource.replace(uri, src);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return newSource;
});
