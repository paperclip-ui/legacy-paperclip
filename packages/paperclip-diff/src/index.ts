import pupetter from "puppeteer";

export class PaperclipDiff {
  private _browser: pupetter.Browser;

  constructor(cwd: string) {}
  async start() {
    this._browser = await pupetter.launch();
  }
  async canDiff() {}
  async snapshot(content: string) {
    const page = await this._browser.newPage();
    await page.setContent(content);
  }
}
