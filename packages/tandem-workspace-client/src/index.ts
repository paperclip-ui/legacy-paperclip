import { RPCClientAdapter } from "@paperclip-ui/common";
import { WorkspaceClientConnection } from "./connection";

export class WorkspaceClient {
  private _connection: WorkspaceClientConnection;
  constructor(private _client: RPCClientAdapter) {
    this._connection = new WorkspaceClientConnection(_client);
  }
}
