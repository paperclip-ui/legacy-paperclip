import { Connection } from "../core/connection";
import { RPCClient } from "../core/rpc";
import { createDocument } from "./documents";
import { deferPromise } from "../core/utils";

export type EditorClientOptions = {
  hostname?: string;
  port: number;
};

export class EditorClient {
  private _connection: Promise<Connection>;
  private _resolveConnection: (Connection) => void;

  /**
   */

  constructor(private _rpcClient: RPCClient) {
    [this._connection, this._resolveConnection] = deferPromise();
    this._rpcClient.onConnection(this._onConnection);
  }

  /**
   * Opens a new editable document
   */

  async open(documentUri: string) {
    const document = createDocument(documentUri, await this._connection);
    await document.open();
    return document;
  }

  /**
   */

  private _onConnection = (connection: Connection) => {
    this._resolveConnection(connection);
  };
}
