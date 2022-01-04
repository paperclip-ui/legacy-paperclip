import * as sn from "./snapshots";
import * as fs from "fs";
import { writeReport } from "./report";
import { Provider, start } from "./core";
import { resolvePCConfig } from "paperclip-utils";
import { PaperclipResourceWatcher } from "paperclip";
import { logInfo } from "./utils";

export type SnapshotOptions = {
  cwd: string;
  force?: boolean;
};

export const snapshot = async (options: SnapshotOptions) => {
  const provider = await start(options.cwd);
  await sn.snapshot(provider)(options.force);
  await provider.close();
};

export type DetectChangesOptions = {
  cwd: string;
  branch: string;
  html?: boolean;
  output?: string;
  open?: boolean;
  watch?: boolean;
};

export const detectChanges = async (options: DetectChangesOptions) => {
  const provider = await start(options.cwd);

  const run = async (open?: boolean) => {
    await detectChanges2({ ...options, open }, provider);

    if (options.watch) {
      logInfo(`Waiting for file changes...`);
      const [config] = resolvePCConfig(fs)(options.cwd);
      const watcher = new PaperclipResourceWatcher(config.srcDir, options.cwd);
      watcher.onChange(() => {
        watcher.dispose();
        run(false);
      });
    }
  };

  await run(options.open);

  if (!options.watch) {
    await provider.close();
  }
};

const detectChanges2 = async (
  options: DetectChangesOptions,
  provider: Provider
) => {
  const result = await sn.detectChanges(provider)(options.branch);
  await writeReport(
    {
      ...result,
      gitDir: provider.gitDir,
      cwd: options.cwd,
      open: options.open
    },
    options
  );
};
