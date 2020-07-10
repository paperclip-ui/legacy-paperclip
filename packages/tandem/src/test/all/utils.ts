// https://github.com/vuejs/vetur/blob/master/test/lsp/helper.ts
import * as vscode from "vscode";

const EXT_IDENTIFIER = `crcn.tandemcode`;

export const ext = vscode.extensions.getExtension(EXT_IDENTIFIER);

export const activate = async () => {
  await ext.activate();
};
