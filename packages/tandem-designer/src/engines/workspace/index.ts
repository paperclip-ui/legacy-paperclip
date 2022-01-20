import { Store } from "../base";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { sockjsClientAdapter } from "@paperclip-ui/common";
import SockJSClient from "sockjs-client";
import { Action } from "../..";
import { DocumentsManager } from "./managers/documents";
import { PaperclipEngineManager } from "./managers/paperclip-engine";
import { ProjectManager } from "./managers/project";

class WorkspaceEngine {
  private _documents: DocumentsManager;
  private _paperclip: PaperclipEngineManager;
  private _project: ProjectManager;

  constructor(private _store: Store) {
    const client = new WorkspaceClient(
      sockjsClientAdapter(
        new SockJSClient(location.protocol + "//" + location.host + "/rt")
      )
    );

    this._project = new ProjectManager(client, _store);
    this._documents = new DocumentsManager(client, this._project, _store);
    this._paperclip = new PaperclipEngineManager(client, this._project, _store);
  }

  handleAction = (action: Action) => {
    this._project.handleAction(action);
    this._documents.handleAction(action);
    this._paperclip.handleAction(action);
  };
}

export const workspaceEngine = (globalStore: Store) => {
  const engine = new WorkspaceEngine(globalStore);
  return engine.handleAction;
};
