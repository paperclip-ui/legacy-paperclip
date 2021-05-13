import * as inquirer from "inquirer";
import * as fs from "fs";
import * as chalk from "chalk";
import * as path from "path";
import { resolveConfigPath } from "./utils";
import { PaperclipOpenDesignConfig } from "./base";

export type InitOptions = {
  cwd: string;
};

export const init = async ({ cwd }: InitOptions) => {
  const configPath = resolveConfigPath(cwd);
  if (fs.existsSync(configPath)) {
    return console.error(
      `Config file already exists! Go ahead and run ${chalk.bold(
        `yarn paperclip-open-design pull`
      )}`
    );
  }

  // 1. ask for token =

  const { token } = await inquirer.prompt([
    {
      type: "input",
      name: "token",
      message: "What's your Open Design token?"
    }
  ]);

  const config: PaperclipOpenDesignConfig = {
    token
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.info(
    `${path.basename(configPath)} created, go ahead and run ${chalk.bold(
      `yarn paperclip-open-design pull`
    )}!`
  );
};
