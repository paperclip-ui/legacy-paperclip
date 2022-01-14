import { Connection } from "../core/connection";
import { RPCClient } from "../core/rpc";
import { ClientDocument } from "./client-document";

export type EditorClientOptions = {
  hostname?: string;
  port: number;
};

export class EditorClient {
  private _connection: Promise<Connection>;

  /**
   */

  constructor(private _rpcClient: RPCClient) {
    this._connection = new Promise(resolve =>
      this._rpcClient.onConnection(resolve)
    );
  }

  /**
   * Opens a new editable document
   */

  async open(documentUri: string) {
    const connection = new ClientDocument(documentUri, await this._connection);
    await connection.open();
    return connection;
  }
}
