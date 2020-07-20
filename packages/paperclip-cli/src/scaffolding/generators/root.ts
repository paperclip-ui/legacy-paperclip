import * as fsa from "fs-extra";
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
  async getParams({ isNewDirectory }) {
    const { sourceDirectory } = await prompt([
      {
        name: "sourceDirectory",
        message: "Source directory where your *.pc files live",
        default: "./src"
      }
    ]);

    let includePercy = false;

    if (isNewDirectory) {
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
        sourceDirectory,
        isNewProject: isNewDirectory
      },
      [...(isNewDirectory ? [node] : []), ...(includePercy ? [percy] : [])]
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
    { sourceDirectory, isNewProject }: any,
    { [GeneratorKind.Root]: { compilerName } = { compilerName: null } }: any
  ) {
    const config: PaperclipConfig = {
      compilerOptions: {
        // no option here, yet
        name: compilerName
      },
      sourceDirectory
    };

    return {
      "paperclip.config.json": JSON.stringify(config, null, 2),
      [sourceDirectory + "/hello-paperclip.pc"]: isNewProject
        ? HELLO_WORLD_CONTENT
        : null
    };
  },
  fin({ isNewProject }) {
    if (!isNewProject) {
      console.warn("🎉 All done!");
    }
  }
};
