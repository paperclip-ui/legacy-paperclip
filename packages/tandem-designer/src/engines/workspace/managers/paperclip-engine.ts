import { nodePathToAry } from "@paperclip-ui/utils";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import {
  Action,
  ActionType,
  workspaceActions,
  virtualNodeStylesInspected,
} from "../../../actions";
import { Store } from "../../base";
import { ProjectManager } from "./project";

export class PaperclipEngineManager {
  constructor(
    private _client: WorkspaceClient,
    private _pm: ProjectManager,
    private _store: Store
  ) {}
  handleAction(action: Action) {
    switch (action.type) {
      case ActionType.NODE_BREADCRUMB_CLICKED:
      case ActionType.CANVAS_MOUSE_DOWN:
      case ActionType.FRAME_TITLE_CLICKED:
      case ActionType.LAYER_LEAF_CLICKED:
      case workspaceActions.pcContentUpdated.type:
      case workspaceActions.projectLoaded.type:
      case ActionType.FILE_OPENED:
        return this._inspectSelectedNodeStyles();
    }
  }
  private _inspectSelectedNodeStyles = async () => {
    const project = this._pm.getMainProject();
    const state = this._store.getState();
    const selectedNodes = this._store.getState().designer.selectedNodePaths;
    if (!project || !selectedNodes) {
      return;
    }

    const inspections = await project.getPaperclip().inspectNodeStyles(
      selectedNodes.map((selectedNodePath) => ({
        path: nodePathToAry(selectedNodePath),
        uri: state.designer.ui.query.canvasFile,
      }))
    );

    this._store.dispatch(virtualNodeStylesInspected(inspections));
  };
}
