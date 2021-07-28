import { EngineDelegate } from "paperclip";
import { Action } from "../../actions";
import * as chokidar from "chokidar";
import * as URL from "url";
import * as path from "path";
import * as fs from "fs";
import { isPaperclipFile } from "paperclip-utils";
import { Observable } from "../core/events";
import { ServerEvent } from "../events";

// export const fileWatcherService = (
//   engine: EngineDelegate,
//   cwd: string,
//   dispatch: (action: Action) => void
// ) => {
//   watchPaperclipSources(engine, cwd);
//   return () => {};
// };

// const watchPaperclipSources = (
//   engine: EngineDelegate,
//   cwd: string = process.cwd()
// ) => {
//   // want to load all PC files within the CWD workspace -- disregard PC configs

//   const watcher = chokidar.watch(
//     "**/*.{pc,css}",

//     // TODO - ignored - fetch .gitignored
//     { cwd: cwd, ignored: ["**/node_modules/**", "node_modules"] }
//   );

//   watcher.on("all", (eventName, relativePath) => {
//     if (!isPaperclipFile(relativePath)) {
//       return;
//     }

//     // fix symlinks
//     const uri = URL.pathToFileURL(
//       fs.realpathSync(path.join(cwd, relativePath))
//     );
//     if (eventName === "change") {
//       engine.updateVirtualFileContent(uri.href, fs.readFileSync(uri, "utf8"));
//     } else if (eventName === "add") {
//       engine.open(uri.href);
//     } else if (eventName === "unlink") {
//       engine.purgeUnlinkedFiles();
//     } else if (eventName === "unlinkDir") {
//       engine.purgeUnlinkedFiles();
//     }
//   });
// };

export const fileWatcherService = () => ({ connect });

const connect = (observable: Observable) => {
  const onEvent = (event: ServerEvent) => {};

  observable.observe({ onEvent });
};
