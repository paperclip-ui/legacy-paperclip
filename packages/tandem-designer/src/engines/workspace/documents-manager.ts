import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { Action } from "../../actions";
import { Store } from "../base";

export class DocumentsManager {
  constructor(private _client: WorkspaceClient, private _store: Store) {}
  handleAction(action: Action) {}
}
