import { ServiceManager } from "./core/service-manager";
import { fileWatcherService } from "./services/file-watcher";
import { sourceWriterService } from "./services/source-writer";

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

export const startServer = async ({
  port: defaultPort,
  localResourceRoots,
  cwd = process.cwd(),
  credentials = {},
  openInitial,
  readonly
}: ServerOptions) => {
  const serviceManager = new ServiceManager(
    sourceWriterService(),
    fileWatcherService()
  );

  serviceManager.initialize();
};
