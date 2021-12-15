import { GeneratorKind } from "./base";
import { prompt } from "inquirer";
import { webpack } from "./webpack";
import { react } from "./react";
import { typescript } from "./typescript";
import { javascript } from "./javascript";
import * as shell from "shelljs";
import * as path from "path";
import * as fs from "fs";
import chalk from "chalk";
import { kebabCase } from "lodash";

const readPackage = (cwd: string) => {
  const pkgPath = path.join(cwd, "package.json");
  return fs.existsSync(pkgPath) ? fs.readFileSync(pkgPath, "utf8") : null;
};

export const node = {
  kind: GeneratorKind.Node,
  async getParams({ cwd, isNewDirectory }) {
    const options = [];

    if (!readPackage(cwd)) {
      options.push(
        {
          name: "name",
          message: "Project name",
          validate: Boolean
        },
        {
          name: "description",
          message: "Project description"
        },
        {
          name: "isPrivate",
          message: "Is this package private?",
          type: "confirm",
          default: true
        },
        {
          name: "useTypescript",
          message: "Use TypeScript?",
          type: "confirm"
        }
      );
    }

    const hasYarnLock = fs.existsSync(path.join(cwd, "yarn.lock"));
    const hasPackageLock = fs.existsSync(path.join(cwd, "package-lock.json"));

    if (!hasYarnLock && !hasPackageLock) {
      options.push({
        name: "packageManager",
        message: "What package manager?",
        type: "list",
        choices: ["npm", "yarn"]
      });
    }

    const {
      name,
      description,
      packageManager = hasYarnLock ? "yarn" : "npm",
      useTypescript,
      isPrivate
    } = await prompt(options);

    return [
      {
        cwd,
        name,
        isPrivate,
        useTypescript,
        packageManager,
        description,
        license: ""
      },
      [
        useTypescript
          ? typescript
          : useTypescript === false
          ? javascript
          : null,
        isNewDirectory ? webpack : null,
        react
      ].filter(Boolean)
    ];
  },
  prepare(params) {
    return {
      [GeneratorKind.Node]: {
        ...params,
        devDependencies: ["paperclip-cli", "concurrently"],
        scripts: params.useTypescript
          ? {
              build: ["paperclip build --only=d.ts"],
              start: ["paperclip build --only=d.ts --watch"],
              "build:watch": ["paperclip build --only=d.ts --watch"],
              "build:definitions": ["paperclip build --only=d.ts"]
            }
          : {}
      }
    };
  },
  generate({ name, description, isPrivate, license, scripts, cwd }: any) {
    // ignore if existing package?
    if (readPackage(cwd)) {
      return {};
    }

    const pkg = {
      name: kebabCase(name),
      description,
      version: "1.0.0",
      private: isPrivate,
      scripts: Object.keys(scripts || {}).reduce(
        (joinedScripts, scriptName) => {
          if (scripts[scriptName].length > 1) {
            joinedScripts[scriptName] = `concurrently ${scripts[scriptName]
              .map(script => {
                return `"${script}"`;
              })
              .join(" ")}`;
          } else {
            joinedScripts[scriptName] = scripts[scriptName].join("");
          }
          return joinedScripts;
        },
        {}
      ),
      license,
      dependencies: {},
      devDependencies: {}
    };

    return {
      "package.json": JSON.stringify(pkg, null, 2)
    };
  },
  async install({ packageManager, cwd, devDependencies, dependencies }) {
    const pm = packageManager;

    await this._installDeps(pm, dependencies, false, cwd);
    await this._installDeps(pm, devDependencies, true, cwd);
  },
  _installDeps(pm, dependencies, dev, cwd) {
    return shell.exec(
      `${pm} ${pm === "npm" ? "install" : "add"} ${dependencies.join(" ")}${
        dev ? " --save-dev" : " --save"
      }`,
      {
        cwd
      }
    );
  },
  async postinstall(
    { cwd, packageManager },
    { [GeneratorKind.Root]: { overwrite } }
  ) {
    return {
      [GeneratorKind.Node]: overwrite
        ? {
            completionMessage: `🎉 All done! Go ahead and run ${chalk.bold(
              `${packageManager} start`
            )}`
          }
        : {}
    };
  },
  fin({ completionMessage }) {
    if (completionMessage) {
      console.info(completionMessage);
    }
  }
};
