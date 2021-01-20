const core = require("./lib/core");
const node = require("./lib/node");

// const { NativeEngine } = require("./native/node/paperclip");
// const fs = require("fs");
// const url = require("url");
// const path = require("path");

// const { EngineMode, EngineDelegate } = lib;

// const { resolveImportUri } = require("paperclip-utils");

// const existsSyncCaseSensitive = (uri) => {
//   const pathname = url.fileURLToPath(uri);
//   const dir = path.dirname(pathname);
//   const basename = path.basename(pathname);
//   return fs.readdirSync(dir).includes(basename);
// };

// const getIOOptions = (options) => {
//   const resolveFile = resolveImportUri(fs);
//   return Object.assign(
//     {
//       readFile: (uri) => {
//         // eslint-disable-next-line
//         return fs.readFileSync(new URL(uri), "utf8");
//       },
//       fileExists: (uri) => {
//         try {
//           // eslint-disable-next-line
//           const url = new URL(uri);

//           // need to make sure that case matches _exactly_ since some
//           // systems are sensitive to that.
//           return existsSyncCaseSensitive(url) && fs.lstatSync(url).isFile();
//         } catch (e) {
//           // eslint-disable-next-line
//           console.error(e);
//           return false;
//         }
//       },
//       resolveFile: (from, to) => {
//         return resolveFile(from, to);
//       },
//       mode: EngineMode.SingleFrame,
//     },
//     options.io,
//     { mode: options.mode }
//   );
// };

// const createEngineDelegate = (options, onCrash) => {
//   const {
//     readFile,
//     fileExists,
//     resolveFile,
//     mode = EngineMode.SingleFrame,
//   } = getIOOptions(options || {});
//   return new EngineDelegate(
//     NativeEngine.new(readFile, fileExists, resolveFile, mode),
//     onCrash ||
//       function (e) {
//         console.error(e);
//       }
//   );
// };

// module.exports = {
//   ...lib,
//   createEngineDelegate,
// };

module.exports = {
  ...core,
  ...node
};
