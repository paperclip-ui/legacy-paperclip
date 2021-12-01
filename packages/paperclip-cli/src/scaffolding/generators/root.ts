import * as fsa from "fs-extra";
import chalk from "chalk";
import * as path from "path";
import { FILES_DIR } from "./utils";
import { GeneratorKind } from "./base";
import { prompt } from "inquirer";
import { node } from "./node";
import { percy } from "./percy";
import { PaperclipConfig } from "paperclip";

const HELLO_WORLD_CONTENT = fsa.readFileSync(
  path.join(FILES_DIR, "hello-paperclip.pc"),
  "utf8"
);

export const root = {
  kind: GeneratorKind.Root,
  async getParams({ cwd, isNewDirectory }) {
    const { sourceDirectory } = await prompt([
      {
        name: "sourceDirectory",
        message: "Source directory where your *.pc files live",
        default: "./src"
      }
    ]);

    let includePercy = false;
    const overwrite = isNewDirectory;

    // if (!isNewDirectory) {
    //   overwrite = (
    //     await prompt([
    //       {
    //         name: "overwrite",
    //         message:
    //           "Would you like to continue as a new project (some files may be overwritten)?",
    //         type: "confirm",
    //         default: false
    //       }
    //     ])
    //   ).overwrite;
    // } else {
    //   overwrite = true;
    // }

    if (overwrite) {
      includePercy = (
        await prompt([
          {
            name: "includePercy",
            type: "confirm",
            message: "Use Percy for visual regression testing?",
            default: false
          }
        ])
      ).includePercy;
    }

    return [
      {
        cwd,
        sourceDirectory,
        overwrite
      },
      [node, ...(includePercy ? [percy] : [])]
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
  generate(
    { sourceDirectory: srcDir, overwrite, cwd }: any,
    { [GeneratorKind.Root]: { compilerName } = { compilerName: null } }: any
  ) {
    const config: PaperclipConfig = {
      srcDir
    };

    const files = {
      [srcDir + "/hello-paperclip.pc"]: overwrite
        ? HELLO_WORLD_CONTENT
        : null
    };

    if (!fsa.existsSync(path.join(cwd, "paperclip.config.json"))) {
      files["paperclip.config.json"] = JSON.stringify(config, null, 2);
    }

    return files;
  },
  fin({ overwrite }) {
    if (!overwrite) {
      console.info("🎉 Successfully installed Paperclip dependencies!");
      console.info("");
      console.info(
        chalk.yellowBright(
          "Next, you'll need to configure your project. Instructions for that are here: \n\n" +
            chalk.underline(`https://paperclip.dev/docs/`)
        )
      );
      console.info("");
    }
  }
};
