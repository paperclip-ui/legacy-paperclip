import { PaperclipResourceWatcher } from "paperclip";
import { resolvePCConfig } from "@paperclipui/utils";
import { produce } from "immer";
const PNG = require("pngjs").PNG;
import * as pupetter from "puppeteer";
import git, { SimpleGit } from "simple-git";
const pixelmatch = require("pixelmatch");

export type Provider = {
  browser: pupetter.Browser;
  git: SimpleGit;
  cwd: string;
  gitDir: string;
  close: () => void;
};

/**
 */

export const start = async (cwd: string): Promise<Provider> => {
  const browser = await pupetter.launch();
  const _git = git(cwd);
  return {
    browser,
    git: _git,
    cwd,
    gitDir: await _git.revparse([`--show-toplevel`]),
    close() {
      browser.close();
    }
  };
};
