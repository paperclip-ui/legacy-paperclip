import { exec } from "child_process";
import { startServer } from "paperclip-designer";

export type ServerOptions = {
  port?: number;
  cwd: string;
  open?: boolean;
};

export const devStart = async ({ port, cwd, open = true }: ServerOptions) => {
  const { port: actualPort } = await startServer({
    port,
    cwd: process.cwd(),
    localResourceRoots: [cwd],
    readonly: true,
    openInitial: open,
    credentials: {
      browserstack: {
        username: process.env.BROWSERSTACK_USERNAME,
        password: process.env.BROWSERSTACK_PASSWORD
      }
    }
  });
};
