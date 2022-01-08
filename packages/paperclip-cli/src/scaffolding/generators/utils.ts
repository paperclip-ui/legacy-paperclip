import * as fs from "fs";
import * as shell from "shelljs";
import * as path from "path";

export const FILES_DIR = path.join(
  __dirname,
  "../../../src/scaffolding/generators/files"
);

export const isUsingYarn = (cwd: string) => {
  return fs.existsSync(path.join(cwd, "yarn.lock"));
};

export const installDep = (
  names: string[],
  cwd: string,
  packageManager?: string,
  dev?: boolean
) => {
  if (!packageManager) {
    packageManager = isUsingYarn(cwd) ? "yarn" : "npm";
  }

  let cmd: string;
  let saveFlags: string;

  if (packageManager === "npm") {
    cmd = "npm install";
    saveFlags = dev ? "--save-dev" : "--save";
  } else {
    cmd = "yarn add";
    saveFlags = "--dev";
  }

  const execCommand = `${cmd} ${names.join(" ")} ${saveFlags}`;
  console.info(`🔗 ${execCommand}`);

  return shell.exec(execCommand, { cwd });
};
