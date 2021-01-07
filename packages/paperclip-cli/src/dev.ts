import { exec } from "child_process";
import { startServer } from "paperclip-visual-editor";

export type ServerOptions = {
  port?: number;
  cwd: string;
};

export const devStart = async ({ port, cwd }: ServerOptions) => {
  const { port: actualPort } = await startServer({
    port,
    cwd: process.cwd(),
    localResourceRoots: [cwd]
  });

  exec(`open http://localhost:${actualPort}`);
};
