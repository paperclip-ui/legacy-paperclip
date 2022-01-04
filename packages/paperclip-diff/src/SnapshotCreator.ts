import * as fsa from "fs-extra";
import * as path from "path";
const pLimit = require("p-limit");
import * as pupetter from "puppeteer";
import { snakeCase } from "lodash";
import { eachFrame } from "paperclip-diff-utils";
import { getSnapshotDir } from "./utils";

export class SnapshotCreator {
  private _browser: pupetter.Browser;

  /**
   */
  constructor(private _gitDir: string, private _cwd: string) {}
  async start() {
    this._browser = await pupetter.launch();
  }
  /**
   */

  public async saveScreenshots(dir: string) {
    const snapshotDir = getSnapshotDir(this._gitDir, dir);

    await fsa.mkdirp(snapshotDir);
    const limit = pLimit(10);

    await eachFrame(
      ".",
      { cwd: this._cwd, skipHidden: true },
      async (html, annotations, title, assets) => {
        return limit(async () => {
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
  }

  /**
   */

  async stop() {
    this._browser.close();
  }
}
