import * as fsa from "fs-extra";
import { prompt } from "inquirer";
import { PaperclipConfig, PC_CONFIG_FILE_NAME } from "paperclip";
import { generateProjectFiles } from "./scaffolding";

export const init = async () => {
  const cwd = process.cwd();
  const isNewDirectory =
    fsa.readdirSync(cwd).filter(file => !/^\./.test(file)).length === 0;

  await generateProjectFiles({ cwd, isNewDirectory });
};
