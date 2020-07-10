import * as vscode from "vscode";
import { expect } from "chai";
import { FIXTURE_FILE_PATHS } from "./constants";
import { activated, timeout } from "./utils";

describe(__filename + "#", () => {
  it("Can open a preview window with the command", async () => {
    const doc = await vscode.workspace.openTextDocument(
      FIXTURE_FILE_PATHS.helloWorldPc
    );
    await vscode.window.showTextDocument(doc, {
      viewColumn: vscode.ViewColumn.Active
    });

    // wait for activated
    await timeout(500);

    await vscode.commands.executeCommand("paperclip.openPreview", doc.uri);
  });
});
