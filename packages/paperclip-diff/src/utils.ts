import * as chalk from "chalk";

export const logWarn = (message: string) => {
  console.warn(chalk.yellow(`[warn]`) + " " + message);
};

export const logInfo = (message: string) => {
  console.warn(chalk.blue(`[info]`) + " " + message);
};

export const logError = (message: string) => {
  console.warn(chalk.red(`[erro] `) + " " + message);
};
