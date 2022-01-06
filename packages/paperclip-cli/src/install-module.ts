const resolve = require("resolve");
import * as path from "path";
const fs = require("fs");
const chalk = require("chalk");
const pkg = require("../package");
import { spawn } from "child_process";
import { prompt } from "inquirer";

export const installOptionalModule = async (
  moduleName: string,
  cwd: string
) => {
  try {
    const resolvedModulePath = resolve.sync(moduleName, { basedir: cwd });
    return require(resolvedModulePath);

    // eslint-disable-next-line
  } catch (e) {}

  const { install } = await prompt({
    name: "install",
    type: "confirm",
    message: `You need to install ${chalk.bold(
      moduleName
    )} to run this command, continue?`
  });

  if (!install) {
    return null;
  }

  await installModule(moduleName, cwd);

  return require(resolve.sync(moduleName, { basedir: cwd }));
};

const installModule = (moduleName: string, cwd: string) => {
  return new Promise(resolve => {
    const args: [string, string[]] = findFile("yarn.lock", cwd)
      ? ["yarn", ["add", moduleName, "--dev"]]
      : ["npm", ["install", moduleName, "--save-dev"]];

    const proc = spawn(args[0], args[1], {
      cwd,
      stdio: ["pipe", "pipe", process.stderr]
    });

    proc.on("close", resolve);
  });
};

const findFile = (fileName: string, cwd: string) => {
  const parts = cwd.split("/");
  for (let i = parts.length; i--; ) {
    const possiblePath = path.join(parts.slice(0, i + 1).join("/"), fileName);
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }
};
