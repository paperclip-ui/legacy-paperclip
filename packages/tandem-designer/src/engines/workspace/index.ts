import { Store } from "../base";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { ImmutableStore, sockjsClientAdapter } from "@paperclip-ui/common";
import SockJSClient from "sockjs-client";
import { Kernel, WorkspaceEngineState } from "./core";
import { Dispatch } from "redux";
import { Action } from "../..";
import { manageLocalState } from "./local-state";
import { manageSideEffects } from "./side-effects";
import { DocumentsManager } from "./documents-manager";
import { PaperclipEngineManager } from "./paperclip-engine";
import { ProjectManager } from "./project-manager";

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
    this._documents = new DocumentsManager(client, _store);
    this._paperclip = new PaperclipEngineManager(client, _store);
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
