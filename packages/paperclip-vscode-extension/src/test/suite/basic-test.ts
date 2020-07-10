import * as vscode from "vscode";

describe(__filename + "#", () => {
  after(() => {
    vscode.window.showInformationMessage("All tests done!");
  });

  it("works", () => {});
});
