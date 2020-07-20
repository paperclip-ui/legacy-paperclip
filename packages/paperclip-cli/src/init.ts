import * as fsa from "fs-extra";
import { prompt } from "inquirer";
import { PaperclipConfig, PC_CONFIG_FILE_NAME } from "paperclip";
import { generateProjectFiles } from "./scaffolding";

export const init = async () => {
  const cwd = process.cwd();
  const isNewDirectory =
    fsa.readdirSync(cwd).filter(file => /^\./.test(file)).length === 0;

  await generateProjectFiles({ cwd, isNewDirectory });
};

export const initOld = async () => {
  const { sourceDirectory } = await prompt([
    {
      name: "sourceDirectory",
      message: "Source directory where your *.pc files live",
      default: "./src"
    }
  ]);

  const config: PaperclipConfig = {
    compilerOptions: {
      // no option here, yet
      name: "paperclip-compiler-react"
    },
    sourceDirectory
  };

  // const sourceDirRealPath = path.join(cwd, sourceDirectory);
  // const filePath = path.join(cwd, PC_CONFIG_FILE_NAME);

  // fsa.writeFileSync(filePath, JSON.stringify(config, null, 2));
  // console.log("Wrote %s", path.basename(PC_CONFIG_FILE_NAME));

  // if (!fsa.existsSync(sourceDirRealPath)) {
  //   fsa.mkdirSync(sourceDirRealPath);
  //   const hwpath = path.join(sourceDirRealPath, "hello-paperclip.pc");
  //   fsa.writeFileSync(hwpath, HELLO_WORLD_CONTENT);
  //   console.log(
  //     "Wrote %s. Go ahead and open it up in VS Code!",
  //     path.relative(cwd, hwpath)
  //   );
  //   console.log(
  //     `Download the extension here: ` +
  //       chalk.underline(
  //         `https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode`
  //       )
  //   );
  // }
};
