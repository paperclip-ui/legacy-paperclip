import * as fsa from "fs-extra";
import chalk from "chalk";
import * as path from "path";
import { FILES_DIR } from "./utils";
import { GeneratorKind } from "./base";
import { prompt } from "inquirer";
import { PaperclipConfig } from "paperclip";
import * as shell from "shelljs";

const HELLO_WORLD_CONTENT = fsa.readFileSync(
  path.join(FILES_DIR, "hello-paperclip.pc"),
  "utf8"
);

export const root = {
  kind: GeneratorKind.Root,
  async getParams({ cwd, isNewDirectory }) {
    const { sourceDirectory, compilerName } = await prompt([
      {
        name: "sourceDirectory",
        message: "Source directory where your *.pc files live",
        default: "./src"
      },
      {
        name: "compilerName",
        type: "list",
        message: "Is there a compiler that you'd like to use?",
        choices: [
          { name: "None", value: null },
          { name: "React", value: "paperclip-compiler-react" }
        ]
      }
    ]);

    return [
      {
        cwd,
        sourceDirectory,
        compilerName
      },
      []
    ];
  },
  prepare(params) {
    return {
      [GeneratorKind.Root]: params
    };
  },
  postinstall(params) {
    return {
      [GeneratorKind.Root]: params
    };
  },
  async install({ compilerName, cwd }: any) {
    if (compilerName) {
      const npmClient = fsa.existsSync(path.join(cwd, "yarn.lock"))
        ? "yarn"
        : "npm";
      const inPackage = fsa.existsSync(path.join(cwd, "package.json"));

      let cmd = `npm i ${compilerName} -g`;

      if (inPackage) {
        if (npmClient === "yarn") {
          cmd = `yarn add ${compilerName} --dev`;
        } else {
          cmd = `npm i ${compilerName} --save-dev`;
        }
      }

      console.info(cmd);

      await shell.exec(cmd);
    }
  },
  async generate({ sourceDirectory: srcDir, cwd }: any) {
    const config: PaperclipConfig = {
      srcDir
    };

    const files = {
      [srcDir + "/hello-paperclip.pc"]: HELLO_WORLD_CONTENT
    };

    if (!fsa.existsSync(path.join(cwd, "paperclip.config.json"))) {
      files["paperclip.config.json"] = JSON.stringify(config, null, 2);
    }

    return files;
  },
  fin({ overwrite }) {
    if (!overwrite) {
      console.info("🎉 All set up!");
      console.info("");
      console.info(
        chalk.cyanBright(
          "Next just run " +
            chalk.underline("npx paperclip build") +
            " to generate code! More docs on this can be found here: \n\n" +
            chalk.underline(`https://paperclip.dev/docs/`)
        )
      );
      console.info("");
    }
  }
};
