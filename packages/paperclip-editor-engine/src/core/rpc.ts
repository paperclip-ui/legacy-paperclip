import { Connection } from "../core/connection";

export type RPCClient = {
  onConnection(listener: (connection: Connection) => void);
};

export type RPCServer = {
  broadcast: (message: any) => void;
} & RPCClient;
