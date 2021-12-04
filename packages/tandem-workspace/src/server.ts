import { Logger, startHTTPServer } from "tandem-common";
import { Designer } from "./controllers/designer";
import execa from "execa";
import { SSHKeys } from "./controllers/ssh";
import { Workspace } from "./controllers/workspace";
import { Kernel } from "./core/kernel";
import { Options } from "./core/options";
import { addRoutes } from "./routes";
import * as url from "url";
import * as path from "path";
import { RPC } from "./controllers/rpc";
import { SocketIo } from "./controllers/socket";
import { VFS } from "./controllers/vfs";

export const start = (options: Options) => {
  init(prepare(options));
};

const prepare = (options: Options) => {
  const logger = new Logger();
  logger.info(`Workspace started 🚀`);

  const [expressServer, httpServer] = startHTTPServer(
    options.http.port,
    logger
  );

  const vfs = new VFS(options.autoSave, logger);
  const sock = new SocketIo(httpServer);
  const workspace = new Workspace(null, new SSHKeys(logger), vfs, logger);

  const kernel: Kernel = {
    options,
    expressServer,
    httpServer,
    sockio: sock,
    rpc: new RPC(sock, workspace, vfs, logger),
    designer: new Designer(expressServer, httpServer),
    workspace,
    logger
  };

  addRoutes(kernel);

  return kernel;
};

const init = async ({ options, workspace }: Kernel) => {
  if (options.project) {
    const project = await workspace.start(
      getProjectUrl(options.project, options.cwd),
      options.branch
    );

    // only useful for CLI usage
    if (options.openInitial) {
      execa("open", [
        `http://localhost:${options.http.port}?projectId=${project.id}&showAll=true`
      ]);
    }
  }
};

const getProjectUrl = (project: string, cwd: string) => {
  if (project.indexOf("git@") === 0) {
    return project;
  }

  const absPath = project.charAt(0) === "/" ? project : path.join(cwd, project);

  return url.pathToFileURL(absPath).href;
};
