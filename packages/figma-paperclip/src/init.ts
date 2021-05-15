import { Config } from "./base";
import * as inquirer from "inquirer";
import * as chalk from "chalk";
import * as fsa from "fs-extra";
import {
  CONFIG_FILE_NAME,
  getConfigPath,
  logInfo,
  COMMAND_NAME
} from "./utils";

export type InitOptions = {
  cwd: string;
};

export const init = async ({ cwd }: InitOptions) => {
  const { url } = await inquirer.prompt([
    {
      type: "input",
      name: "url",
      message: "What's the Figma url that you'd like to import?"
    }
  ]);

  const config: Config = {
    sources: [url]
  };

  logInfo(
    `Wrote ${CONFIG_FILE_NAME}, you can now run ${chalk.bold(
      `${COMMAND_NAME} pull`
    )}.`
  );

  fsa.writeFileSync(getConfigPath(cwd), JSON.stringify(config, null, 2));
};
