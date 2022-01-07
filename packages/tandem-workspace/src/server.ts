import { Logger, startHTTPServer } from "@tandemui/common";
import { Designer } from "./controllers/designer";
import { SSHKeys } from "./controllers/ssh";
import { Workspace } from "./controllers/workspace";
import { Project } from "./controllers/project";
import { Kernel } from "./core/kernel";
import { Options } from "./core/options";
import { addRoutes } from "./routes";
import { RPC } from "./controllers/rpc";
import { SocketIo } from "./controllers/socket";
import { VFS } from "./controllers/vfs";
const getPort = require("get-port");

export { Workspace, Project };

export const start = async (options: Options) => {
  return (await prepare(options)).workspace;
};

const prepare = async (options: Options) => {
  const logger = new Logger();
  logger.info(`Workspace started 🚀`);

  const httpPort = options.http?.port || (await getPort());

  const [expressServer, httpServer] = startHTTPServer(httpPort, logger);

  const vfs = new VFS(options.autoSave, logger);
  const sock = new SocketIo(httpServer);
  const workspace = new Workspace(
    null,
    new SSHKeys(logger),
    vfs,
    logger,
    options,
    httpPort
  );

  const kernel: Kernel = {
    options,
    expressServer,
    httpServer,
    sockio: sock,
    rpc: new RPC(sock, workspace, vfs, logger, httpPort, options),
    designer: new Designer(expressServer),
    workspace,
    logger
  };

  addRoutes(kernel);

  // need to wait for http server to spin up. This is a really dumb approach.
  await new Promise(resolve => {
    setTimeout(resolve, 500);
  });

  return kernel;
};

// const init = async ({ options, workspace }: Kernel) => {
//   if (options.project) {
//     const project = await workspace.start(
//       getProjectUrl(options.project, options.cwd),
//       options.branch
//     );

//     // only useful for CLI usage
//     if (options.openInitial) {
//       execa("open", [
//         `http://localhost:${options.http.port}?projectId=${project.id}&showAll=true`
//       ]);
//     }
//   }
// };
