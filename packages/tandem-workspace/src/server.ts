import { Logger, startHTTPServer } from "@tandem-ui/common";
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
import { createEngineDelegate, EngineMode } from "@paperclip-ui/core";
import { EditorHost } from "@paperclip-ui/editor-engine/lib/host/host";
import { createEditorHostRPCClient } from "./editor-host-utils";

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

  const paperclipEngine = createEngineDelegate({
    mode: EngineMode.MultiFrame
  });
  const documentManager = new EditorHost(
    paperclipEngine,
    createEditorHostRPCClient(sock)
  );

  const workspace = new Workspace(
    null,
    new SSHKeys(logger),
    vfs,
    logger,
    paperclipEngine,
    options,
    httpPort
  );

  const kernel: Kernel = {
    options,
    expressServer,
    documentManager,
    paperclipEngine,
    httpServer,
    sockio: sock,
    rpc: new RPC(
      sock,
      workspace,
      paperclipEngine,
      vfs,
      logger,
      httpPort,
      options
    ),
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
