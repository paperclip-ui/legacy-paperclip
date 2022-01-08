import * as fs from "fs";
import * as url from "url";
import { VirtualFragment, stringifyVirtualNode } from "@paperclip-ui/core";

export const getPCDocumentHTML = (root: VirtualFragment) => {
  return `<html><head><meta charset="utf-8"></head><body><style>body { margin: 0px; padding: 0px }</style>${stringifyVirtualNode(
    root
  )}</body></html>`;
};

export const getDocumenAssetPaths = (source: string) => {
  const re = `([\\('"])(file://.*?)([\\)'"])`;
  const global = new RegExp(re, "g");
  const local = new RegExp(re);
  const matches = source.match(global) || [];
  const uris = [];

  for (const match of matches) {
    const [, , uri] = match.match(local);

    // shouldn't happen, but just in case
    try {
      const pathname = url.fileURLToPath(uri);
      if (fs.existsSync(pathname)) {
        uris.push(pathname);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return uris;
};

export const embedAssets = (
  source: string,
  serializeFilePath: (value: string) => string
) => {
  let newSource = source;
  const re = `([\\('"])(file://.*?)([\\)'"])`;
  const global = new RegExp(re, "g");
  const local = new RegExp(re);
  const matches = source.match(global) || [];

  const assetPaths = getDocumenAssetPaths(source);

  for (const assetPath of assetPaths) {
    const newUrl = serializeFilePath(assetPath);
    newSource = newSource.replace(url.pathToFileURL(assetPath).href, newUrl);
  }

  return newSource;
};
