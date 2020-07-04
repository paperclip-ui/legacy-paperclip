import * as fs from "fs";
import * as path from "path";
import { prompt } from "inquirer";
import { PaperclipConfig, PC_CONFIG_FILE_NAME } from "paperclip";

export const init = async () => {
  const { filePattern, moduleDirectory } = await prompt([
    {
      name: "filePattern",
      message: "File pattern for *.pc files",
      default: "./src/**/*.pc"
    },
    {
      name: "moduleDirectory",
      message: "Modules directory",
      default: "node_modules"
    }
  ]);

  const config: PaperclipConfig = {
    compilerOptions: {
      // no option here, yet
      name: "paperclip-compiler-react"
    },
    filesGlob: filePattern,
    moduleDirectories: [moduleDirectory]
  };

  const filePath = path.join(process.cwd(), PC_CONFIG_FILE_NAME);

  fs.writeFileSync(filePath, JSON.stringify(config, null, 2));

  console.log("Wrote %s", path.basename(PC_CONFIG_FILE_NAME));
};
