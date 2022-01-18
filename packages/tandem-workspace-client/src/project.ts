import { RPCClientAdapter } from "@paperclip-ui/common";
import {
  getAllPaperclipFilesChannel,
  openProjectChannel
} from "@tandem-ui/workspace-core";
import { EditorClient } from "@paperclip-ui/editor-engine/lib/client/client";
import { PCDocument } from "@paperclip-ui/editor-engine/lib/client/documents";

export type LoadOptions = {
  id?: string;
  uri?: string;
};

export class Project {
  private _openProject: ReturnType<typeof openProjectChannel>;
  private _id: string;
  private _getAllPaperclipFiles: ReturnType<typeof getAllPaperclipFilesChannel>;

  private constructor(
    private _loadOptions: LoadOptions,
    private _documents: EditorClient,
    private _client: RPCClientAdapter
  ) {
    this._openProject = openProjectChannel(_client);
    this._getAllPaperclipFiles = getAllPaperclipFilesChannel(_client);
  }

  static async load(
    options: LoadOptions,
    documents: EditorClient,
    client: RPCClientAdapter
  ) {
    const project = new Project(options, documents, client);
    await project._open();
    return project;
  }

  getDocuments() {
    return this._documents;
  }

  private async _open() {
    const projectId =
      this._loadOptions.id ||
      (await this._openProject.call(this._loadOptions)).projectId;
    this._id = projectId;
  }

  async openAllPaperclipDocuments() {
    const fileUris = await this._getAllPaperclipFiles.call({
      projectId: this._id
    });
    const docs: PCDocument[] = [];
    for (const uri of fileUris) {
      docs.push(await this._documents.open(uri));
    }
    return docs;
  }
}
