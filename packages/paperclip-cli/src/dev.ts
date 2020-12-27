import * as path from "path";
import * as fs from "fs";
import {
  PC_CONFIG_FILE_NAME,
  EngineMode,
  createEngineDelegate,
  PaperclipConfig
} from "paperclip";
import chalk from "chalk";

export type ServerOptions = {
  port?: number;
  cwd: string;
};

export const devStart = async ({ port, cwd }: ServerOptions) => {
  let module;

  try {
    module = require(require.resolve("paperclip-visual-editor", {
      paths: [process.cwd()]
    }));
  } catch (e) {
    console.error(
      chalk.yellow(
        `Visual editor not found, you'll need to install that: ${chalk.underline(
          `npm install paperclip-visual-editor --save-dev`
        )}`
      )
    );
    process.exit(1);
  }

  const { startServer } = module;

  const config: PaperclipConfig = JSON.parse(
    fs.readFileSync(path.join(cwd, PC_CONFIG_FILE_NAME), "utf8")
  ) as PaperclipConfig;

  const engine = await createEngineDelegate({
    mode: EngineMode.MultiFrame
  });

  const _serverResult = await startServer({
    port,
    engine,
    localResourceRoots: [cwd]
  });

  // exec(`open http://localhost:${serverResult.port}`);
};
