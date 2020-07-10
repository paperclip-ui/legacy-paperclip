import { ExtensionContext } from "vscode";
import { activate as activateLanguageClient } from "./language";

export const activate = (context: ExtensionContext) => {
  activateLanguageClient(context);
};

export function deactivate(): Thenable<void> {
  return undefined;
}
