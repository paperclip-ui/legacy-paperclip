import * as sn from "./snapshots";
import * as fs from "fs";
import { writeReport } from "./report";
import { Provider, start } from "./core";
import { resolvePCConfig } from "paperclip-utils";
import { PaperclipResourceWatcher } from "paperclip";
import { logInfo } from "./utils";

export type SnapshotOptions = {
  cwd: string;
};

export const snapshot = async (options: SnapshotOptions) => {
  const provider = await start(options.cwd);
  await sn.snapshot(provider);
  await provider.close();
};

export type DetectChangesOptions = {
  cwd: string;
  branch: string;
  html?: boolean;
  watch?: boolean;
};

export const detectChanges = async (options: DetectChangesOptions) => {
  const provider = await start(options.cwd);

  const run = async () => {
    await detectChanges2(options, provider);

    if (options.watch) {
      logInfo(`Waiting for file changes...`);
      const [config] = resolvePCConfig(fs)(options.cwd);
      const watcher = new PaperclipResourceWatcher(config.srcDir, options.cwd);
      watcher.onChange(() => {
        watcher.dispose();
        run();
      });
    }
  };

  await run();

  if (!options.watch) {
    await provider.close();
  }
};

const detectChanges2 = async (
  options: DetectChangesOptions,
  provider: Provider
) => {
  const result = await sn.detectChanges(provider)(options.branch);
  await writeReport(result, options);
};
