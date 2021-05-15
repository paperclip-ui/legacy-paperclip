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

  // 1. ask for token =

  const { useGoogleFonts } = await inquirer.prompt([
    {
      type: "list",
      name: "useGoogleFonts",
      message: "Would you like to use Google Fonts?",
      choices: [
        { name: "yes", value: true },
        { name: "no", value: false }
      ]
    }
  ]);

  const config: PaperclipOpenDesignConfig = {
    useGoogleFonts
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.info(
    `${path.basename(configPath)} created, go ahead and run ${chalk.bold(
      `yarn paperclip-open-design pull`
    )}!`
  );
};
