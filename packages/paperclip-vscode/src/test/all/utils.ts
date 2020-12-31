// https://github.com/vuejs/vetur/blob/master/test/lsp/helper.ts
import * as vscode from "vscode";
import * as assert from "assert";

const EXT_IDENTIFIER = `crcn.paperclip`;

export const ext = vscode.extensions.getExtension(EXT_IDENTIFIER);

export const timeout = async (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const openDocument = async (filePath: string) => {
  const doc = await vscode.workspace.openTextDocument(filePath);

  await vscode.window.showTextDocument(doc, {
    viewColumn: vscode.ViewColumn.Active
  });

  return doc;
};

export const typeText = async (
  text: string,
  doc: vscode.TextDocument,
  offset?: number
) => {
  const edit = new vscode.WorkspaceEdit();
  edit.insert(
    doc.uri,
    offset != null
      ? doc.positionAt(offset)
      : doc.positionAt(doc.getText().length),
    text
  );
  edit.delete(
    doc.uri,
    new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length))
  );
  await vscode.workspace.applyEdit(edit);
  await timeout(100);
};

export const clearAllText = async (doc: vscode.TextDocument) => {
  const edit = new vscode.WorkspaceEdit();
  edit.delete(
    doc.uri,
    new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length))
  );
  await vscode.workspace.applyEdit(edit);
};

export const openPreview = async (filePath: string) => {
  const doc = await vscode.workspace.openTextDocument(filePath);

  await vscode.window.showTextDocument(doc, {
    viewColumn: vscode.ViewColumn.Active
  });

  // wait for activated.
  // FIXME: this is bad. Need better way to do this.
  await timeout(1000);

  await vscode.commands.executeCommand("paperclip.openPreview", doc.uri);

  return doc;
};

export const testCompletion = async (
  doc: vscode.TextDocument,
  items: string[],
  position?: vscode.Position
) => {
  if (!position) {
    position = doc.positionAt(doc.getText().length);
  }

  const result = (await vscode.commands.executeCommand(
    "vscode.executeCompletionItemProvider",
    doc.uri,
    doc.positionAt(doc.getText().length)
  )) as vscode.CompletionList;

  console.log(result, items);

  for (const expectedItem of items) {
    // some syntactic sugar -- ! tells us to omit from tests
    if (expectedItem.charAt(0) === "!") {
      const excludeItemText = expectedItem.substr(1);
      const excluded = result.items.every(
        resultItem => resultItem.label !== excludeItemText
      );
      if (!excluded) {
        assert.fail(
          `Found completion item "${expectedItem}" when it shouldn't exist.`
        );
      }
    } else {
      const found = result.items.some(
        resultItem => resultItem.label === expectedItem
      );
      if (!found) {
        assert.fail(` Expected completion item "${expectedItem}" not found.`);
      }
    }
  }
};
