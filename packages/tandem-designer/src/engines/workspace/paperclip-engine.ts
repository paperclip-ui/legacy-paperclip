import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { Action } from "../../actions";
import { Store } from "../base";

export class PaperclipEngineManager {
  constructor(private _client: WorkspaceClient, private _store: Store) {}
  handleAction(action: Action) {}
}
