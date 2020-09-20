import * as path from "path";
import * as fs from "fs";
import { PC_CONFIG_FILE_NAME, createEngine, PaperclipConfig } from "paperclip";

export type ServerOptions = {
  port?: number;
  cwd: string;
};

export const devStart = async ({ port, cwd }: ServerOptions) => {
  let module;

  try {
    module = require("paperclip-visual-editor");
  } catch (e) {
    console.error(
      `you'll need to install the visual editor: "npm install paperclip-visual-editor"`
    );
  }

  const { startServer } = module;

  const config: PaperclipConfig = JSON.parse(
    fs.readFileSync(path.join(cwd, PC_CONFIG_FILE_NAME), "utf8")
  ) as PaperclipConfig;

  const engine = await createEngine();
  const _serverResult = await startServer({
    port,
    engine,
    localResourceRoots: [cwd]
  });

  // exec(`open http://localhost:${serverResult.port}`);
};
