import { RPCClientAdapter } from "@paperclip-ui/common";
import { WorkspaceClientConnection } from "./connection";
import { openFileChannel } from "@tandem-ui/workspace-core";

export class Project {
  constructor(uri: string, private _client: RPCClientAdapter) {}
  open() {}
}
