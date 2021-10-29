import * as fsa from "fs-extra";
import { generateProjectFiles } from "./scaffolding";

export const init = async () => {
  const cwd = process.cwd();
  const isNewDirectory =
    fsa.readdirSync(cwd).filter(file => !/^\./.test(file)).length === 0;

  await generateProjectFiles({ cwd, isNewDirectory });
};
