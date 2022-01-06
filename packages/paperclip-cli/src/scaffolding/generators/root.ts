import * as fsa from "fs-extra";
import chalk from "chalk";
import * as path from "path";
import { FILES_DIR, installDep } from "./utils";
import { GeneratorKind } from "./base";
import { prompt } from "inquirer";
import { PaperclipConfig } from "paperclip";

const HELLO_WORLD_CONTENT = fsa.readFileSync(
  path.join(FILES_DIR, "hello-paperclip.pc"),
  "utf8"
);

type Params = {
  cwd: string;
  outDir: string;
  srcDir: string;
  compilerName: string;
};

export const root = {
  kind: GeneratorKind.Root,
  async getParams({ cwd, isNewDirectory }): Promise<[Params, any]> {
    const { srcDir, outDir, compilerName } = await prompt([
      {
        name: "srcDir",
        message: "Paperclip source directory",
        default: "./src"
      },
      {
        name: "outDir",
        message: "Paperclip compile directory",
        default: "./lib"
      },
      {
        name: "compilerName",
        type: "list",
        message: "Is there a compiler that you'd like to use?",
        choices: [
          { name: "None", value: undefined },
          { name: "React", value: "@paperclipui/compiler-react" },
          { name: "HTML", value: "@paperclipui/compiler-html" }
        ]
      }
    ]);

    return [
      {
        cwd,
        srcDir,
        outDir,
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
    await installDep(["paperclip", "@paperclipui/cli"], cwd, null, true);
    if (compilerName) {
      await installDep([compilerName], cwd, null, true);
    }
  },
  async generate({ srcDir, outDir, compilerName, cwd }: Params) {
    const config: PaperclipConfig = {
      compilerOptions: [
        {
          target: compilerName.replace("@paperclipui/compiler-", ""),
          outDir
        }
      ],
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
            chalk.underline("npx @paperclipui/cli build") +
            " to generate code! More docs on this can be found here: \n\n" +
            chalk.underline(`https://paperclip.dev/docs/`)
        )
      );
      console.info("");
    }
  }
};
