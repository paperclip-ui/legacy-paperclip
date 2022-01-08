import { commands } from "vscode";
import { LiveWindowManager } from "./preview/live-window-manager";
import { Uri, window, env } from "vscode";
import { isPaperclipFile } from "@paperclip-ui/utils";
import { fixFileUrlCasing } from "./utils";

export class CommandManager {
  constructor(private _windows: LiveWindowManager) {}

  private _openPreview(sticky: boolean) {
    if (window.activeTextEditor) {
      if (isPaperclipFile(String(window.activeTextEditor.document.uri))) {
        const paperclipUri = fixFileUrlCasing(
          String(window.activeTextEditor.document.uri)
        );
        this._windows.open(paperclipUri, sticky);
      } else {
        window.showErrorMessage(
          `Only Paperclip (.pc) are supported in Live Preview`
        );
      }
    }
  }
  activate() {
    commands.registerCommand("paperclip.openPreview", () =>
      this._openPreview(false)
    );

    commands.registerCommand("paperclip.openStickyPreview", () =>
      this._openPreview(true)
    );

    commands.registerCommand("paperclip.giveFeedback", () => {
      env.openExternal(
        Uri.parse("https://github.com/paperclipui/paperclip/issues")
      );
    });
  }
}
