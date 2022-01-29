import { ContentChange } from "@paperclip-ui/source-writer";
import { ExprSource } from "@paperclip-ui/utils";
import { LogLevel, RPCServer } from "@paperclip-ui/common";

export type ProjectOptions = {
  installDependencies?: boolean;
};

export type WorkspaceAdapter = {
  revealSource: (source: ExprSource) => void;
};

export type Options = {
  pause?: boolean;
  logLevel: LogLevel;
  autoSave?: boolean;
  rpcServer?: RPCServer;
  useHttpServer?: boolean;
  http?: {
    port: number;
  };

  standalone?: boolean;
  showFullEditor?: boolean;

  // Canvas file to open if none are present. Used particularly
  // for codespaces
  canvasFile?: string;

  // branch of project
  branch?: string;
  project?: ProjectOptions;

  adapter?: WorkspaceAdapter;
};
