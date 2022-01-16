import { RPCClientAdapter } from "@paperclip-ui/common";
import { WorkspaceClientConnection } from "./connection";
import { Project } from "./project";

export class WorkspaceClient {
  private _connection: WorkspaceClientConnection;
  constructor(private _client: RPCClientAdapter) {}
  openProject(uri: string) {
    const project = new Project(uri, this._client);
  }
}
