const { NativeEngine } = require("../../native/node/paperclip");
import * as fs from "fs";
import { URL, fileURLToPath } from "url";
import * as path from "path";
import { EngineDelegate, EngineMode } from "../core";

import { resolveImportUri, resolvePCConfig } from "@paperclip-ui/utils";

const existsSyncCaseSensitive = (uri) => {
  const pathname = fileURLToPath(String(uri));
  const dir = path.dirname(pathname);
  const basename = path.basename(pathname);
  if (!fs.existsSync(dir)) {
    return false;
  }
  return fs.readdirSync(dir).includes(basename);
};

const getIOOptions = (options) => {
  const resolveFile = resolveImportUri(fs);
  return Object.assign(
    {
      readFile: (uri) => {
        // eslint-disable-next-line
        // ts-ignore
        return fs.readFileSync(new URL(uri), "utf8");
      },
      fileExists: (uri) => {
        try {
          // eslint-disable-next-line
          const url = new URL(uri);

          // need to make sure that case matches _exactly_ since some
          // systems are sensitive to that.
          return existsSyncCaseSensitive(url) && fs.lstatSync(url).isFile();
        } catch (e) {
          // eslint-disable-next-line
          console.error(e);
          return false;
        }
      },
      resolveFile: (from, to) => {
        // TRUE boolean flag necessary here to resolve symlinks.
        return resolveFile(from, to);
      },
      getLintConfig: (uri) => {
        const info = resolvePCConfig(fs)(uri);
        if (!info) {
          return null;
        }

        return info[0].lintOptions;
      },
      mode: EngineMode.SingleFrame,
    },
    options.io,
    {
      mode: options.mode,
      includedUsedExpressions: options.includeUsedExpressions,
    }
  );
};

// eslint-disable-next-line
export const createEngineDelegate = (options = {}, onCrash: any = () => {}) => {
  const io = getIOOptions(options || {});
  const {
    readFile,
    fileExists,
    resolveFile,
    getLintConfig,
    mode = EngineMode.SingleFrame,
  } = io;
  return new EngineDelegate(
    NativeEngine.new(readFile, fileExists, resolveFile, getLintConfig, mode),
    io,
    onCrash ||
      function (e) {
        console.error(e);
      }
  );
};

export const loadEngineDelegate = createEngineDelegate;
