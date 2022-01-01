import * as pupetter from "puppeteer";
import * as chalk from "chalk";
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
  async snapshot() {
    const status = await this._git.status();

    if (status.ahead) {
      logWarn(
        `You need to commit your changes before you can make a snapshot.`
      );
      this._browser.close();
      return;
    }

    console.log(status);
    const latestCommit = (await this._git.log()).latest.hash;

    await fsa.mkdirp(path.join(this._cwd, PC_HIDDEN_DIR, ""));

    await eachFrame(
      ".",
      { cwd: this._cwd, skipHidden: true },
      async (html, annotations, title, assets) => {
        console.log(`Snapshot ${snakeCase(title)}`);
        const page = await this._browser.newPage();
        await page.setContent(html);
      }
    );
    // const filePaths = glob.sync(paperclipSourceGlobPattern(this._cwd));
    // // const css = filePaths.reduce((css, filePath) => {
    // //   return [...css, this._interim.parseFile(filePath).css.sheetText];
    // // }, []).join("\n");

    // for (const filePath of filePaths) {
    //   const result = this._engine.open(
    //     URL.pathToFileURL(filePath).href
    //   ) as EvaluatedPCData;

    //   // const frames = getChildren(result.preview);

    //   const html = `
    //     <html>
    //       <head>
    //         <style>
    //           ${stringifyCSSSheet(result.sheet)}
    //         </style>
    //       </head>
    //       <body>
    //         ${stringifyVirtualNode(result.preview)}
    //       </body>
    //     </html>
    //   `;

    //   console.log(html);
    //   const page = await this._browser.newPage();
    //   await page.setContent(html);

    //   await page.screenshot({
    //     path: path.join(
    //       this._cwd,
    //       ".paperclip",
    //       Math.round(Math.random() * 99999) + ".png"
    //     )
    //   });
    // }
    // await this._browser.close();

    // await page.setContent();
  }
  async detectChanges(branch?: string, watch?: boolean) {}
}

const getSnapshotDir = (cwd: string, latestCommit: string) =>
  path.join(cwd, PC_HIDDEN_DIR, "snapshots", latestCommit);
const getBaseSnapshotsDir = (cwd: string, latestCommit: string) =>
  path.join(getSnapshotDir(cwd, latestCommit), "base");
