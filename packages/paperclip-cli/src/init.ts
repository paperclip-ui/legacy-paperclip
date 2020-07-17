import * as fsa from "fs-extra";
import * as path from "path";
import * as chalk from "chalk";
import { prompt } from "inquirer";
import { PaperclipConfig, PC_CONFIG_FILE_NAME } from "paperclip";

const HELLO_WORLD_CONTENT = fsa.readFileSync(
  path.join(__dirname, "../src/", "hello-paperclip.pc"),
  "utf8"
);

export const init = async () => {
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

  const cwd = process.cwd();

  const sourceDirRealPath = path.join(cwd, sourceDirectory);
  const filePath = path.join(cwd, PC_CONFIG_FILE_NAME);

  fsa.writeFileSync(filePath, JSON.stringify(config, null, 2));
  console.log("Wrote %s", path.basename(PC_CONFIG_FILE_NAME));

  if (!fsa.existsSync(sourceDirRealPath)) {
    fsa.mkdirSync(sourceDirRealPath);
    const hwpath = path.join(sourceDirRealPath, "hello-paperclip.pc");
    fsa.writeFileSync(hwpath, HELLO_WORLD_CONTENT);
    console.log(
      "Wrote %s. Go ahead and open it up in VS Code!",
      path.relative(cwd, hwpath)
    );
    console.log(
      `Download the extension here: ` +
        chalk.underline(
          `https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode`
        )
    );
  }
};
