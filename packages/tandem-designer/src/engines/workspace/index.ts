import { Store } from "../base";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { RPCClientAdapter, wsAdapter } from "@paperclip-ui/common";
import { Action } from "../..";
import { DocumentsManager } from "./managers/documents";
import { PaperclipEngineManager } from "./managers/paperclip-engine";
import { ProjectManager } from "./managers/project";
import { EditManager } from "./managers/edit";
import { MainDocumentManager } from "./managers/main-document";
import { EmbeddedState } from "../../state";

declare const DESIGNER_STATE: EmbeddedState | null;

const createDefaultRPCClient = () =>
  wsAdapter(
    () =>
      new WebSocket(
        "ws://" +
          (typeof DESIGNER_STATE === "undefined"
            ? location.host
            : DESIGNER_STATE.host) +
          "/ws"
      )
  );

export type WorkspaceEngineOptions = {
  createRPCClient?: () => RPCClientAdapter;
};

class WorkspaceEngine {
  private _documents: DocumentsManager;
  private _paperclip: PaperclipEngineManager;
  private _project: ProjectManager;
  private _edits: EditManager;
  private _mainDocumentManager: MainDocumentManager;

  constructor(_store: Store, _options: WorkspaceEngineOptions) {
    const connection = (_options.createRPCClient || createDefaultRPCClient)();

    const client = new WorkspaceClient(connection);

    this._project = new ProjectManager(client, _store);
    this._documents = new DocumentsManager(client, this._project, _store);
    this._mainDocumentManager = new MainDocumentManager(_store, this._project);
    this._paperclip = new PaperclipEngineManager(this._project, _store);
    this._edits = new EditManager(this._project, _store);
  }

  handleAction = (action: Action) => {
    this._project.handleAction(action);
    this._documents.handleAction(action);
    this._paperclip.handleAction(action);
    this._edits.handleAction(action);
    this._mainDocumentManager.handleAction(action);
  };
}

export const workspaceEngine = (
  globalStore: Store,
  options: WorkspaceEngineOptions
) => {
  const engine = new WorkspaceEngine(globalStore, options);
  return engine.handleAction;
};
