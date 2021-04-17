import {
  ExtensionContext,
  workspace,
  window,
  StatusBarAlignment
} from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as findUp from "find-up";
import { activate as activateLanguageClient } from "./language";
import { spawn, fork } from "child_process";

// eslint-disable-next-line
const selfPkg = require("../../package");

export const activate = async (context: ExtensionContext) => {

  // nobody using this, don't do it
  // await installDeps();
  console.log("initializing");
  activateLanguageClient(context);
  checkVersionMatch(context);
};

const installDeps = async () => {
  // const statusBar = window.createStatusBarItem(StatusBarAlignment.Left);
  const statusBar = window.setStatusBarMessage(
    "$(sync~spin) Warming up Paperclip..."
  );

  const ngrokDir = path.join(__dirname, "..", "..", "node_modules", "ngrok");

  console.log("installing ", ngrokDir);

  const proc = fork(path.join(ngrokDir, "postinstall.js"));

  proc.on("error", e => {
    console.error(e);
  });
  await new Promise(resolve => {
    proc.on("exit", resolve);
  });

  statusBar.dispose();
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

  if (selfMajor !== cliMajor) {
    const details = `(extension version: v${
      selfPkg.version
    }, dependency version: v${pcCLIVersion.replace(/[^\wd.]/g, "")})`;

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
