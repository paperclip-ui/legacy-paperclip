import { Config } from "./state";
import * as inquirer from "inquirer";
import * as chalk from "chalk";
import * as fsa from "fs-extra";
import { merge } from "lodash";
import {
  CONFIG_FILE_NAME,
  getConfigPath,
  logInfo,
  COMMAND_NAME
} from "./utils";

export type InitOptions = {
  cwd: string;
};

const DEFAULT_CONFIG: Config = {
  sources: [],
  outputDir: null,
  atoms: {
    prefix: "$"
  }
};

export const init = async ({ cwd }: InitOptions) => {
  const { url, outputDir } = await inquirer.prompt([
    {
      type: "input",
      name: "url",
      message: "What's the Figma url that you'd like to import?"
    },
    {
      type: "input",
      name: "outputDir",
      default: "src",
      message: "Where would you like your designs to be saved to?"
    }
  ]);

  const config: Config = merge({}, DEFAULT_CONFIG, {
    sources: [url],
    outputDir
  });

  const source = `module.exports = ${JSON.stringify(config, null, 2)};`;

  logInfo(
    `Wrote ${CONFIG_FILE_NAME}, you can now run ${chalk.bold(
      `${COMMAND_NAME} pull`
    )}.`
  );

  fsa.writeFileSync(getConfigPath(cwd), source);
};
