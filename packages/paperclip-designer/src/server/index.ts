import { fileWatcherService } from "./services/file-watcher";
import { httpServer } from "./services/http-server";
import { eventLogger } from "./services/event-logger";
import { rpcService } from "./services/rpc";
import { postInitService } from "./services/post-init";
import { pcEngineService } from "./services/pc-engine";
import { BaseEvent, ServiceManager, ServerKernel } from "paperclip-common";
import { ExprSource } from "paperclip-utils";
import { noop } from "lodash";

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
  revealSource?: (source: ExprSource) => void;
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
  handleEvent,
  revealSource = noop
}: ServerOptions) => {
  const kernel = new ServerKernel();

  const serviceManager = new ServiceManager(kernel).add(
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
