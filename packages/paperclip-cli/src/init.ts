import * as fs from "fs";
import * as path from "path";
import { prompt } from "inquirer";
import { PaperclipConfig, PC_CONFIG_FILE_NAME } from "paperclip";

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

  const filePath = path.join(process.cwd(), PC_CONFIG_FILE_NAME);

  fs.writeFileSync(filePath, JSON.stringify(config, null, 2));

  console.log("Wrote %s", path.basename(PC_CONFIG_FILE_NAME));
};
