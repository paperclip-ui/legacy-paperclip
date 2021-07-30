import { ServiceInitialized, ServiceManager } from "./core/service-manager";
import { fileWatcherService } from "./services/file-watcher";
import { httpServer } from "./services/http-server";
import { ServerKernel } from "./core/kernel";
import { sourceWriterService } from "./services/source-writer";
import { eventLogger } from "./services/event-logger";
import { rpcService } from "./services/rpc";
import { postInitService } from "./services/post-init";
import { pcEngineService } from "./services/pc-engine";
import { BaseEvent } from "paperclip-common";

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
  handleEvent?: (event: BaseEvent) => void;
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
  readonly,
  handleEvent
}: ServerOptions) => {
  const revealSource = () => {
    console.log("TODO!");
  };

  const kernel = new ServerKernel();

  const serviceManager = new ServiceManager(kernel).add(
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

  if (handleEvent) {
    kernel.events.observe({ handleEvent });
  }

  serviceManager.initialize();
};
