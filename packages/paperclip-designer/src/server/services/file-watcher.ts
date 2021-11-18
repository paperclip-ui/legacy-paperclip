import * as chokidar from "chokidar";
import * as URL from "url";
import * as path from "path";
import * as fs from "fs";
import { isPaperclipFile } from "paperclip-utils";
import { eventProcesses, ServerKernel } from "paperclip-common";
import { PCEngineInitialized } from "./pc-engine";

type Options = {
  cwd: string;
};

export const fileWatcherService = (options: Options) => load(options);

const load = (options: Options) => (kernel: ServerKernel) => {
  kernel.events.observe({
    handleEvent: eventProcesses({
      [PCEngineInitialized.TYPE]: init(options, kernel)
    })
  });
};

const init = ({ cwd }: Options, kernel: ServerKernel) => ({
  engine
}: PCEngineInitialized) => {
  const watcher = chokidar.watch(
    "**/*.{pc,css}",

    // TODO - ignored - fetch .gitignored
    { cwd: cwd, ignored: ["**/node_modules/**", "node_modules"] }
  );

  watcher.on("all", (eventName, relativePath) => {
    if (!isPaperclipFile(relativePath)) {
      return;
    }

    // fix symlinks
    const uri = URL.pathToFileURL(
      fs.realpathSync(path.join(cwd, relativePath))
    );
    if (eventName === "change") {
      engine.updateVirtualFileContent(uri.href, fs.readFileSync(uri, "utf8"));
    } else if (eventName === "add") {
      engine.open(uri.href);
    } else if (eventName === "unlink") {
      engine.purgeUnlinkedFiles();
    } else if (eventName === "unlinkDir") {
      engine.purgeUnlinkedFiles();
    }
  });

  return {
    dispose() {
      watcher.close();
    }
  };
};