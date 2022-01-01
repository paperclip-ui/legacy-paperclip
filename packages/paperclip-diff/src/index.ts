import * as pupetter from "puppeteer";
const pLimit = require("p-limit");
import * as path from "path";
import { eachFrame } from "paperclip-diff-utils";
import { snakeCase } from "lodash";
import git, { SimpleGit } from "simple-git";
import * as fsa from "fs-extra";
import { logWarn } from "./utils";

const PC_HIDDEN_DIR = ".paperclip";

export class PaperclipDiff {
  private _browser: pupetter.Browser;
  private _git: SimpleGit;

  constructor(private _cwd: string) {
    this._git = git(this._cwd);
  }
  async start() {
    this._browser = await pupetter.launch();
    return this;
  }
  private _getGITDir() {
    return this._git.revparse([`--show-toplevel`]);
  }
  async snapshot() {
    const status = await this._git.status();

    if (status.files.length) {
      logWarn(
        `You need to commit your changes before you can make a snapshot.`
      );
      // this._browser.close();
      // return;
    }
    const gitDir = await this._getGITDir();

    const latestCommit = (await this._git.log()).latest.hash;

    const snapshotDir = getBaseSnapshotsDir(gitDir, latestCommit);

    await fsa.mkdirp(snapshotDir);
    const limit = pLimit(10);

    await eachFrame(
      ".",
      { cwd: this._cwd, skipHidden: true },
      async (html, annotations, title, assets) => {
        return limit(async () => {
          console.log(`Snapshot ${title}`);
          const fileName = snakeCase(title) + ".png";
          const page = await this._browser.newPage();

          // TODO - responsive sizes

          page.setViewport({ width: 1400, height: 768 });
          await page.setContent(html);
          await page.screenshot({
            path: path.join(snapshotDir, fileName)
          });
        });
      }
    );

    await this._browser.close();
  }
  async detectChanges(branch?: string, watch?: boolean) {}
}

const getSnapshotDir = (cwd: string, latestCommit: string) =>
  path.join(cwd, PC_HIDDEN_DIR, "snapshots", latestCommit);
const getBaseSnapshotsDir = (cwd: string, latestCommit: string) =>
  path.join(getSnapshotDir(cwd, latestCommit), "base");
