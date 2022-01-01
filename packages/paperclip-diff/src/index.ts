import * as pupetter from "puppeteer";
import * as path from "path";
import * as URL from "url";
import * as glob from "glob";
import { createEngineDelegate, EngineDelegate } from "paperclip";
import {
  paperclipSourceGlobPattern,
  stringifyVirtualNode,
  EvaluatedDataKind,
  stringifyCSSSheet,
  EvaluatedPCData,
  getChildren
} from "paperclip-utils";

export class PaperclipDiff {
  private _browser: pupetter.Browser;
  private _engine: EngineDelegate;

  constructor(private _cwd: string) {}
  async start() {
    this._browser = await pupetter.launch();
    this._engine = createEngineDelegate();
  }
  async snapshot() {
    const filePaths = glob.sync(paperclipSourceGlobPattern(this._cwd));
    // const css = filePaths.reduce((css, filePath) => {
    //   return [...css, this._interim.parseFile(filePath).css.sheetText];
    // }, []).join("\n");

    for (const filePath of filePaths) {
      const result = this._engine.open(
        URL.pathToFileURL(filePath).href
      ) as EvaluatedPCData;

      // const frames = getChildren(result.preview);

      const html = `
        <html>
          <head>
            <style>
              ${stringifyCSSSheet(result.sheet)}
            </style>
          </head>
          <body>
            ${stringifyVirtualNode(result.preview)}
          </body>
        </html>
      `;

      console.log(html);
      const page = await this._browser.newPage();
      await page.setContent(html);

      await page.screenshot({
        path: path.join(
          this._cwd,
          ".paperclip",
          Math.round(Math.random() * 99999) + ".png"
        )
      });
    }
    await this._browser.close();

    // await page.setContent();
  }
  async detectChanges(branch?: string, watch?: boolean) {}
}
