import { PCMutation, PCSourceWriter } from "paperclip-source-writer";
import * as vscode from "vscode";
import * as fs from "fs";
import { worker } from "cluster";
import * as url from "url";

export function activate() {
  // const contents: Record<string, string> = {};

  // vscode.workspace.onDidChangeTextDocument(editor => {
  //   contents[editor.document.uri.toString()] = editor.document.getText();
  // });

  // vscode.workspace.onDidCloseTextDocument(document => {
  //   delete contents[document.uri.toString()];
  // });

  const writer = new PCSourceWriter({
    getContent: async (uri: string) => {
      const filePath = url.fileURLToPath(uri);
      const doc = await vscode.workspace.openTextDocument(filePath);
      return doc.getText();
      // return contents[uri] || fs.readFileSync(uri, "utf8");
    }
  });

  const handleMutation = async (mutation: PCMutation) => {
    const filePath = url.fileURLToPath(mutation.source.uri);
    const doc = await vscode.workspace.openTextDocument(filePath);
    const changes = await writer.getContentChanges(mutation);
    const tedits = changes.map(change => {
      return new vscode.TextEdit(
        new vscode.Range(
          doc.positionAt(change.start),
          doc.positionAt(change.end)
        ),
        change.value
      );
    });
    const wsEdit = new vscode.WorkspaceEdit();
    wsEdit.set(vscode.Uri.parse(mutation.source.uri), tedits);
    await vscode.workspace.applyEdit(wsEdit);
  };
  return {
    handleMutation
  };
}
