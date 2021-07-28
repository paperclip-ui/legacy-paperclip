import * as chokidar from "chokidar";
import * as URL from "url";
import * as path from "path";
import * as fs from "fs";
import { isPaperclipFile } from "paperclip-utils";
import { eventProcesses } from "../core/events";
import { ServerKernel } from "../core/kernel";
import { PCEngineEventType, PCEngineInitialized } from "./pc-engine";

type Options = {
  cwd: string;
};

export const fileWatcherService = (options: Options) => ({
  connect: connect(options)
});

const connect = (options: Options) => (kernel: ServerKernel) => {
  kernel.events.observe({
    onEvent: eventProcesses({
      [PCEngineEventType.INITIALIZED]: init(options, kernel)
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
