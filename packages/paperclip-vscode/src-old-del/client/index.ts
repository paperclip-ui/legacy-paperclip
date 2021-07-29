import {
  ExtensionContext,
  workspace,
  window,
  StatusBarAlignment
} from "vscode";
import * as fs from "fs";
import * as path from "path";
import { activate as activateLanguageClient } from "./language";
import { spawn, fork } from "child_process";

export const activate = async (context: ExtensionContext) => {
  // nobody using this, don't do it
  // await installDeps();
  console.log("initializing");
  activateLanguageClient(context);
};

export function deactivate(): Thenable<void> {
  return undefined;
}
