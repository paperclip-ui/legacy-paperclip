import { RPCClientAdapter } from "@paperclip-ui/common";
import { WorkspaceClientConnection } from "./connection";
import { openFileChannel } from "@tandem-ui/workspace-core";
import { EditorClient } from "@paperclip-ui/editor-engine/lib/client/client";

export class Project {
  constructor(
    uri: string,
    private _editorClient: EditorClient,
    private _client: RPCClientAdapter
  ) {}
}
