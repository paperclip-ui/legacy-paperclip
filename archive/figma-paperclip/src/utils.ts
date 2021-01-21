import { camelCase } from "lodash";
import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
export const pascalCase = (value: string) =>
  value.substr(0, 1).toUpperCase() + camelCase(value.substr(1));

export const logWarn = (message: string) => {
  console.warn(chalk.yellow(`warning`) + " " + message);
};

export const logInfo = (message: string) => {
  console.warn(chalk.blue(`info`) + " " + message);
};
export const logSuccess = (message: string) => {
  console.warn(chalk.green(`success`) + " " + message);
};

export const logError = (message: string) => {
  console.warn(chalk.red(`error`) + " " + message);
};

export type SourceUrlInfo = Partial<{
  projectId?: number;
  projectName?: string;
  teamId?: string;
}>;

export const extractSourceUrlInfo = (url: string): SourceUrlInfo => {
  const matches1 = url.match(
    /https:\/\/www.figma.com\/files\/(.*?)\/team\/(.*?)\//
  );
  let projectId: string;
  let teamId: string;
  let projectName: string;
  if (matches1) {
    // projectId = matches1[1];
    teamId = matches1[2];
  }
  const matches2 = url.match(
    /https:\/\/www.figma.com\/files\/(.*?)\/project\/(.*?)\/(.*?)/
  );
  if (matches2) {
    projectId = matches2[2];
    projectName = matches2[3];
    // teamId = matches2[2];
  }

  const matches3 = url.match(
    /https:\/\/www.figma.com\/files\/project\/(.*?)\/(.*?)/
  );
  if (matches3) {
    projectId = matches3[1];
    projectName = matches3[2];
  }

  return {
    projectId: Number(projectId),
    projectName,
    teamId
  };
};

export const installDependencies = (
  names: string[],
  cwd: string,
  dev?: boolean
) => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(cwd, "package.json"), "utf8")
  );

  const installedDeps = (dev ? pkg.devDependencies : pkg.dependencies) || {};

  const toInstall = names.filter(name => !installedDeps[name]);

  if (!toInstall.length) {
    return;
  }

  logInfo(`Installing: ${toInstall.join(", ")}`);

  const yarnLockExists = fs.existsSync(path.join(cwd, "yarn.lock"));

  if (yarnLockExists) {
    const args = ["add", ...toInstall];
    if (dev) {
      args.push("--save-dev");
    }
    return exec("yarn", args, cwd, false);
  } else {
    const args = ["install", ...toInstall];
    if (dev) {
      args.push("--save-dev");
    }

    return exec("npm", args, cwd, false);
  }
};

export const exec = (
  command: string,
  args: string[],
  cwd: string,
  pipe: boolean = true
) => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd });
    if (pipe) {
      proc.stdout.pipe(process.stdout);
    }
    proc.stderr.pipe(process.stderr);
    proc.on("exit", resolve);
  });
};
