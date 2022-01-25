import { RPCClientAdapter } from "@paperclip-ui/common";
import {
  getAllPaperclipFilesChannel,
  openProjectChannel,
  popoutWindowChannel,
} from "@tandem-ui/workspace-core";
import { EditorClient } from "@paperclip-ui/editor-engine/lib/client/client";
import { PCDocument } from "@paperclip-ui/editor-engine/lib/client/documents";
import { PaperclipManager } from "./paperclip";

export type LoadOptions = {
  id?: string;
  uri?: string;
};

export type ProjectProperties = {
  id: string;
  directoryPath: string;
  directoryUri: string;
};

export class Project {
  private _properties: ProjectProperties;
  private _paperclip: PaperclipManager;
  private _openProject: ReturnType<typeof openProjectChannel>;
  private _getAllPaperclipFiles: ReturnType<typeof getAllPaperclipFilesChannel>;
  private _popoutWindow: ReturnType<typeof popoutWindowChannel>;

  /**
   */

  private constructor(
    private _loadOptions: LoadOptions,
    private _editorClient: EditorClient,
    private _client: RPCClientAdapter
  ) {
    this._openProject = openProjectChannel(_client);
    this._popoutWindow = popoutWindowChannel(_client);
    this._getAllPaperclipFiles = getAllPaperclipFilesChannel(_client);
    this._paperclip = new PaperclipManager(this._client);
  }

  /**
   */

  getProperties() {
    return this._properties;
  }

  /**
   */

  getPaperclip() {
    return this._paperclip;
  }

  /**
   */

  openNewWindow(path: string) {
    this._popoutWindow.call({ path });
  }

  /**
   */

  static async load(
    options: LoadOptions,
    documents: EditorClient,
    client: RPCClientAdapter
  ) {
    const project = new Project(options, documents, client);
    await project._open();
    return project;
  }

  /**
   */

  getDocuments() {
    return this._editorClient.getDocuments();
  }

  /**
   */

  private async _open() {
    this._properties = await this._openProject.call(this._loadOptions);
  }

  /**
   */

  async openAllPaperclipDocuments() {
    const fileUris = await this._getAllPaperclipFiles.call({
      projectId: this._properties.id,
    });
    const docs: PCDocument[] = await Promise.all(
      fileUris.map((uri) => {
        return this._editorClient.getDocuments().open(uri);
      })
    );
    return docs;
  }
}
