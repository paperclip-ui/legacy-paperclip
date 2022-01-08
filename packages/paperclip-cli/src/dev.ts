// import { startServer } from "@tandem-ui/designer";

export type ServerOptions = {
  port?: number;
  cwd: string;
  open?: boolean;
};

export const devStart = async ({ port, cwd, open = true }: ServerOptions) => {
  // await startServer({
  //   port,
  //   cwd: process.cwd(),
  //   localResourceRoots: [cwd],
  //   readonly: true,
  //   openInitial: open,
  //   credentials: {
  //     browserstack: {
  //       username: process.env.BROWSERSTACK_USERNAME,
  //       password: process.env.BROWSERSTACK_PASSWORD
  //     }
  //   }
  // });
};
