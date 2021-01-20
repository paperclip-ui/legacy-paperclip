const { NativeEngine } = require("../../native/node/paperclip");
import * as fs from "fs";
import { URL, fileURLToPath } from "url";
import * as path from "path";
import { EngineDelegate, EngineMode } from "../core";

const { resolveImportUri } = require("paperclip-utils");

const existsSyncCaseSensitive = uri => {
  const pathname = fileURLToPath(uri);
  const dir = path.dirname(pathname);
  const basename = path.basename(pathname);
  return fs.readdirSync(dir).includes(basename);
};

const getIOOptions = options => {
  const resolveFile = resolveImportUri(fs);
  return Object.assign(
    {
      readFile: uri => {
        // eslint-disable-next-line
        // ts-ignore
        return fs.readFileSync(new URL(uri), "utf8");
      },
      fileExists: uri => {
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
        return resolveFile(from, to);
      },
      mode: EngineMode.SingleFrame
    },
    options.io,
    { mode: options.mode }
  );
};

export const createEngineDelegate = (options = {}, onCrash: any = () => {}) => {
  const {
    readFile,
    fileExists,
    resolveFile,
    mode = EngineMode.SingleFrame
  } = getIOOptions(options || {});
  return new EngineDelegate(
    NativeEngine.new(readFile, fileExists, resolveFile, mode),
    onCrash ||
      function(e) {
        console.error(e);
      }
  );
};
