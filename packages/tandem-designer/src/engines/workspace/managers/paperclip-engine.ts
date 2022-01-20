import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { Action, ActionType, workspaceActions } from "../../../actions";
import { Store } from "../../base";

export class PaperclipEngineManager {
  constructor(private _client: WorkspaceClient, private _store: Store) {}
  handleAction(action: Action) {
    switch (action.type) {
      case ActionType.NODE_BREADCRUMB_CLICKED:
      case ActionType.CANVAS_MOUSE_DOWN:
      case ActionType.FRAME_TITLE_CLICKED:
      case ActionType.LAYER_LEAF_CLICKED:
      case workspaceActions.pcContentUpdated.type:
      case ActionType.FILE_OPENED:
        return this._inspectSelectedNodeStyles();
    }
  }
  private _inspectSelectedNodeStyles = () => {
    const selectedNodes = this._store.getState().designer.selectedNodePaths;
  };
}
