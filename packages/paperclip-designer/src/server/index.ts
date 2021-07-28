import { ServiceManager } from "./core/service-manager";
import { fileWatcherService } from "./services/file-watcher";
import { httpServer } from "./services/http-server";
import { ServerKernel } from "./core/kernel";
import { sourceWriterService } from "./services/source-writer";
import { eventLogger } from "./services/event-logger";
import { rpcService } from "./services/rpc";
import { postInitService } from "./services/post-init";
import { pcEngineService } from "./services/pc-engine";

type BrowserstackCredentials = {
  username: string;
  password: string;
};

export type ServerOptions = {
  localResourceRoots: string[];
  port?: number;
  cwd?: string;
  readonly?: boolean;
  openInitial: boolean;
  credentials?: {
    browserstack?: BrowserstackCredentials;
  };
};

export const startServer = ({
  port: defaultPort,
  localResourceRoots,
  cwd = process.cwd(),
  credentials = {},
  openInitial,
  readonly
}: ServerOptions) => {
  const revealSource = () => {
    console.log("TODO!");
  };

  const serviceManager = new ServiceManager(new ServerKernel()).add(
    // watches for
    sourceWriterService(),
    fileWatcherService({ cwd }),
    pcEngineService(),
    httpServer({ defaultPort, localResourceRoots }),
    eventLogger(),
    postInitService({ openInitial }),
    rpcService({
      revealSource,
      localResourceRoots
    })
  );

  serviceManager.initialize();
};
