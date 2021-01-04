import * as path from "path";
import * as fs from "fs";
import {
  PC_CONFIG_FILE_NAME,
  EngineMode,
  createEngineDelegate,
  PaperclipConfig
} from "paperclip";
import { startServer } from "paperclip-visual-editor";

export type ServerOptions = {
  port?: number;
  cwd: string;
};

export const devStart = async ({ port, cwd }: ServerOptions) => {
  let module;

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
