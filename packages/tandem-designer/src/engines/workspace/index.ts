import { Store } from "../base";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { RPCClientAdapter, sockjsClientAdapter } from "@paperclip-ui/common";
import SockJSClient from "sockjs-client";
import { Action } from "../..";
import { DocumentsManager } from "./managers/documents";
import { PaperclipEngineManager } from "./managers/paperclip-engine";
import { ProjectManager } from "./managers/project";

const createDefaultRPCClient = () =>
  sockjsClientAdapter(
    new SockJSClient(location.protocol + "//" + location.host + "/rt")
  );

export type WorkspaceEngineOptions = {
  createRPCClient?: () => RPCClientAdapter;
};

class WorkspaceEngine {
  private _documents: DocumentsManager;
  private _paperclip: PaperclipEngineManager;
  private _project: ProjectManager;

  constructor(private _store: Store, private _options: WorkspaceEngineOptions) {
    const client = new WorkspaceClient(
      (_options.createRPCClient || createDefaultRPCClient)()
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

export const workspaceEngine = (
  globalStore: Store,
  options: WorkspaceEngineOptions
) => {
  const engine = new WorkspaceEngine(globalStore, options);
  return engine.handleAction;
};
