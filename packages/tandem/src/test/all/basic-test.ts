import * as vscode from "vscode";
import { FIXTURE_FILE_PATHS } from "./constants";
import { activate } from "./utils";

describe(__filename + "#", () => {
  before(async () => {
    await activate();
  });
  after(() => {
    vscode.window.showInformationMessage("All tests done!");
  });

  it("Can open a preview window with the command", async () => {
    const doc = await vscode.workspace.openTextDocument(
      FIXTURE_FILE_PATHS.helloWorldPc
    );
    vscode.window.showTextDocument(doc, {
      viewColumn: vscode.ViewColumn.Active
    });

    await vscode.commands.executeCommand("paperclip.openPreview", doc.uri);

    await new Promise(resolve => {
      setTimeout(resolve, 1000 * 5);
    });
  });
});
