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
    localResourceRoots: [cwd],
    readonly: true,
    openInitial: true,
    credentials: {
      browserstack: {
        username: process.env.BROWSERSTACK_USERNAME,
        password: process.env.BROWSERSTACK_PASSWORD
      }
    }
  });
};
