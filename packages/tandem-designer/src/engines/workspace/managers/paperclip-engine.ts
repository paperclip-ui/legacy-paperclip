import { nodePathToAry } from "@paperclip-ui/utils";
import {
  Action,
  ActionType,
  workspaceActions,
  virtualNodeStylesInspected,
} from "../../../actions";
import {
  AppState,
  flattenFrameBoxes,
  getActiveFrameIndex,
  getActivePCData,
  getNodeInfoAtPoint,
  getScopedBoxes,
  isExpanded,
} from "../../../state";
import { Store } from "../../base";
import { ProjectManager } from "./project";

export class PaperclipEngineManager {
  constructor(private _pm: ProjectManager, private _store: Store) {}

  handleAction(action: Action) {
    this._maybeInspectSelectedNodeStyles(action);
    this._maybeRevealNodeSource(action);
    this._maybeRevealSourceFromCanvas(action);
    this._maybeRevealStyleRuleSource(action);
    this._maybeLoadAvailableInsertableElements(action);
  }

  /**
   */

  private _maybeInspectSelectedNodeStyles(action: Action) {
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

  private _maybeRevealNodeSource(action: Action) {
    switch (action.type) {
      case ActionType.NODE_BREADCRUMB_CLICKED:
      case ActionType.LAYER_LEAF_CLICKED: {
        const { metaKey, nodePath } = action.payload;
        if (!metaKey) {
          return;
        }
        this._revealNodeSources(nodePath);
        break;
      }
    }
  }

  private _maybeRevealSourceFromCanvas(action: Action) {
    switch (action.type) {
      case ActionType.CANVAS_MOUSE_DOWN: {
        const { metaKey } = action.payload;
        if (!metaKey) {
          return;
        }
        this._revealNodeSourceInCanvas();
        break;
      }
    }
  }

  private _maybeLoadAvailableInsertableElements(action: Action) {
    switch (action.type) {
      case ActionType.GLOBAL_META_I_KEY_PRESS: {
        this._loadInsertableElements();
      }
    }
  }

  private _maybeRevealStyleRuleSource(action: Action) {
    switch (action.type) {
      case ActionType.STYLE_RULE_FILE_NAME_CLICKED: {
        return this._revealNodeBySourceId(action.payload.styleRuleSourceId);
      }
    }
  }

  private async _loadInsertableElements() {
    const state: AppState = this._store.getState();
    const insertableNodes = await this._pm
      .getMainProject()
      .getPaperclip()
      .loadInsertableNodes({ activeUri: state.designer.ui.query.canvasFile });
    this._store.dispatch(
      workspaceActions.insertableNodesLoaded(insertableNodes)
    );
  }

  private async _revealNodeSourceInCanvas() {
    const state: AppState = this._store.getState();

    const nodeInfo = getNodeInfoAtPoint(
      state.designer.canvas.mousePosition,
      state.designer.canvas.transform,
      getScopedBoxes(
        flattenFrameBoxes(state.designer.frameBoxes),
        state.designer.scopedElementPath,
        getActivePCData(state.designer).preview
      ),
      isExpanded(state.designer) ? getActiveFrameIndex(state.designer) : null
    );

    // maybe offscreen
    if (!nodeInfo) {
      return;
    }

    await this._revealNodeSources(nodeInfo.nodePath);
  }

  private _revealNodeSources = async (nodePath: string) => {
    const state = this._store.getState();
    const project = this._pm.getMainProject();
    await project.getPaperclip().revealNodeSource({
      path: nodePathToAry(nodePath),
      uri: state.designer.ui.query.canvasFile,
    });
  };

  private _revealNodeBySourceId = async (sourceId: string) => {
    const project = this._pm.getMainProject();
    await project.getPaperclip().revealNodeBySourceId(sourceId);
  };

  private _inspectSelectedNodeStyles = async () => {
    const project = this._pm.getMainProject();
    const state = this._store.getState();
    const selectedNodes = this._store.getState().designer.selectedNodePaths;
    if (!project || !selectedNodes.length) {
      return;
    }

    try {
      const inspections = await project.getPaperclip().inspectNodeStyles(
        selectedNodes.map((selectedNodePath) => ({
          path: nodePathToAry(selectedNodePath),
          uri: state.designer.ui.query.canvasFile,
        }))
      );

      this._store.dispatch(virtualNodeStylesInspected(inspections));
    } catch (e) {
      console.error(e);
    }
  };
}
