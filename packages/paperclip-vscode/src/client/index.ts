import { ExtensionContext, workspace, window } from "vscode";
import * as fs from "fs";
import * as findUp from "find-up";
import { activate as activateLanguageClient } from "./language";
import { setFlagsFromString } from "v8";

const selfPkg = require("../../package");

export const activate = (context: ExtensionContext) => {
  activateLanguageClient(context);
  checkVersionMatch(context);
};

export function deactivate(): Thenable<void> {
  return undefined;
}

/**
 * Ensures that the VS Code extension & whatever's installed
 * as a dep are a match.
 */

const checkVersionMatch = (context: ExtensionContext) => {
  const packagePath = findUp.sync("package.json", { cwd: workspace.rootPath });
  if (!packagePath) {
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  const pcCLIVersion =
    (pkg.devDependencies || {})["paperclip-cli"] ||
    (pkg.dependencies || {})["paperclip-cli"];

  // paperclip not installed
  if (!pcCLIVersion) {
    return;
  }

  const cliMajor = getMajorVersion(pcCLIVersion);

  // maybe *? Ignore.
  if (!cliMajor) {
    return cliMajor;
  }

  const selfMajor = getMajorVersion(selfPkg.version);

  if (selfMajor === cliMajor) {
    const details = `(extension version: v${
      selfPkg.version
    }, dependency version: v${pcCLIVersion.replace(/[^\wd\.]/g, "")})`;

    let message = "";

    if (selfMajor > cliMajor) {
      message = `Paperclip: this extension requires newer Paperclip dependencies ${details}. You \u00a0 need to upgrade your Paperclip dependencies, or download a different version of the extension that matches them (v${cliMajor}.x.x).`;
    } else {
      message = `Paperclip: your extension needs to updated ${details}.`;
    }

    window.showWarningMessage(message, "ok");
  }
};

const getMajorVersion = semver => {
  const v = (semver.match(/(\d+)/) || [])[1];
  return v && Number(v);
};
