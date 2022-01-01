import * as chalk from "chalk";

export const logWarn = (message: string) => {
  console.warn(chalk.yellow(`[warning]`) + " " + message);
};

export const logInfo = (message: string) => {
  console.warn(chalk.blue(`[info]`) + " " + message);
};
export const logSuccess = (message: string) => {
  console.warn(chalk.green(`[success]`) + " " + message);
};

export const logError = (message: string) => {
  console.warn(chalk.red(`[error]`) + " " + message);
};
