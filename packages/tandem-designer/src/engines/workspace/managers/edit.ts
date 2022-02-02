import { Action, ActionType } from "../../..";
import { ProjectManager } from "./project";
import { Store } from "../../base";
import {
  ChildInsertion,
  ChildInsertionKind,
  VirtualObjectEdit,
  VirtualObjectEditKind,
} from "@paperclip-ui/editor-engine/lib/core";
import { computeVirtScriptObject } from "@paperclip-ui/utils";
import {
  DesignerState,
  flattenFrameBoxes,
  getFrameFromIndex,
} from "../../../state";
import { uiActions } from "../../../actions/ui-actions";
import {
  AvailableNode,
  AvailableNodeKind,
} from "@paperclip-ui/language-service";

export class EditManager {
  constructor(private _pm: ProjectManager, private _store: Store) {}
  async handleAction(action: Action) {
    const state = this._store.getState();
    const edits = getEdits(this._store.getState().designer, action);

    if (!edits) {
      return;
    }

    const project = this._pm.getMainProject();
    const document = await project
      .getDocuments()
      .open(state.designer.ui.query.canvasFile);

    document.editVirtualObjects(edits);
  }
}

const getEdits = (
  state: DesignerState,
  action: Action
): null | VirtualObjectEdit[] => {
  switch (action.type) {
    case ActionType.RESIZER_STOPPED_MOVING:
    case ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING:
    case ActionType.FRAME_TITLE_CHANGED:
    case ActionType.GLOBAL_H_KEY_DOWN: {
      return getUpdateAnnotationEdits(state);
    }
    case ActionType.GLOBAL_BACKSPACE_KEY_PRESSED: {
      return getDeletionEdit(state);
    }
    case uiActions.toolLayerDrop.type: {
      return getDropEdit(state, action);
    }
  }
  return null;
};

const getUpdateAnnotationEdits = (
  state: DesignerState
): VirtualObjectEdit[] => {
  return state.selectedNodePaths.map((nodePath) => {
    const frame = getFrameFromIndex(Number(nodePath), state);
    if (!frame) {
      return null;
    }
    return {
      kind: VirtualObjectEditKind.SetAnnotations,
      nodePath,
      value: computeVirtScriptObject(frame.annotations),
    };
  });
};

const getDeletionEdit = (state: DesignerState): VirtualObjectEdit[] => {
  return state.selectedNodePaths.map((nodePath) => {
    return {
      kind: VirtualObjectEditKind.DeleteNode,
      nodePath,
    };
  });
};

const getDropEdit = (
  state: DesignerState,
  action: ReturnType<typeof uiActions.toolLayerDrop>
): VirtualObjectEdit[] => {
  const child = mapAvailableNodeToInsertable(action.payload.node);
  console.log(action.payload.node, state.highlightNodePath, child);
  return [
    {
      kind: VirtualObjectEditKind.AppendChild,
      child,
      nodePath: state.highlightNodePath,
    },
  ];
};

const mapAvailableNodeToInsertable = (node: AvailableNode): ChildInsertion => {
  if (node.kind === AvailableNodeKind.Text) {
    return { kind: ChildInsertionKind.Text, value: "Double click to edit" };
  } else if (node.kind === AvailableNodeKind.Element) {
    return { kind: ChildInsertionKind.Element, value: `<${node.name} />` };
  } else if (node.kind === AvailableNodeKind.Instance) {
    return {
      kind: ChildInsertionKind.Instance,
      name: node.name,
      sourceUri: node.sourceUri,
    };
  }
};
