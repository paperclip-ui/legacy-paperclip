import { RPCClientAdapter } from "@paperclip-ui/common";
import { openProjectChannel } from "@tandem-ui/workspace-core";
import { EditorClient } from "@paperclip-ui/editor-engine/lib/client/client";

export class Project {
  private _openProject: ReturnType<typeof openProjectChannel>;
  private _id: string;

  private constructor(
    readonly uri: URL,
    private _documents: EditorClient,
    private _client: RPCClientAdapter
  ) {
    this._openProject = openProjectChannel(_client);
  }
  static async load(
    uri: URL,
    documents: EditorClient,
    client: RPCClientAdapter
  ) {
    const project = new Project(uri, documents, client);
    await project._open();
    return project;
  }

  getDocuments() {
    return this._documents;
  }

  private async _open() {
    const { projectId } = await this._openProject.call({ uri: this.uri.href });
    this._id = projectId;
  }
}
