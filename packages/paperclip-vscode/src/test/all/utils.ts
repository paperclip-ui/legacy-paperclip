// https://github.com/vuejs/vetur/blob/master/test/lsp/helper.ts
import * as vscode from "vscode";

const EXT_IDENTIFIER = `crcn.tandem`;

export const ext = vscode.extensions.getExtension(EXT_IDENTIFIER);

export const activated = async () => {
  vscode.extensions.onDidChange(e => {
    console.log("CHANGE", e);
  });
};

export const timeout = async (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));
