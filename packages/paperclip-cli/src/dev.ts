import * as path from "path";
import * as fs from "fs";
import { startServer } from "paperclip-visual-editor";
import { PC_CONFIG_FILE_NAME, createEngine, PaperclipConfig } from "paperclip";
import { exec } from "child_process";

export type ServerOptions = {
  port?: number;
  cwd: string;
};

export const devStart = async ({ port, cwd }: ServerOptions) => {
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
