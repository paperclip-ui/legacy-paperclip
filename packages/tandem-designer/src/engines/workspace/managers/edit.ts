import {
  Action,
  ActionType,
  VirtualStyleDeclarationValueChanged,
} from "../../..";
import { ProjectManager } from "./project";
import { Store } from "../../base";
import {
  ChildInsertion,
  VirtualObjectEdit,
  VirtualObjectEditKind,
} from "@paperclip-ui/editor-engine/lib/core";
import {
  computeVirtScriptObject,
  ELEMENT_INSERT_ATTR,
} from "@paperclip-ui/utils";
import {
  DEFAULT_FRAME_BOX,
  DesignerState,
  getFrameFromIndex,
  getScaledPoint,
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
    const edits = getEdits(this._store.getState().designer, action).filter(
      Boolean
    );

    if (!edits.length) {
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
    case ActionType.VIRTUAL_STYLE_DECLARATION_VALUE_CHANGED: {
      return getStyleDeclarationEdit(action);
    }
  }
  return [];
};

const getUpdateAnnotationEdits = (
  state: DesignerState
): VirtualObjectEdit[] => {
  return state.selectedNodePaths.map((nodePath) => {
    // cover 0.0
    if (nodePath.includes(".")) {
      return null;
    }
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
  const point = getScaledPoint(action.payload.point, state.canvas.transform);

  if (state.highlightNodePath) {
    return [
      {
        kind: VirtualObjectEditKind.AppendChild,
        nodePath: state.highlightNodePath,
        child,
      },
    ];
  }

  return [
    {
      kind: VirtualObjectEditKind.AddFrame,
      child,
      box: {
        x: point.x - DEFAULT_FRAME_BOX.width / 2,
        y: point.y - DEFAULT_FRAME_BOX.height / 2,
        width: DEFAULT_FRAME_BOX.width,
        height: DEFAULT_FRAME_BOX.height,
      },
    },
  ];
};

const mapAvailableNodeToInsertable = (node: AvailableNode): ChildInsertion => {
  if (node.kind === AvailableNodeKind.Text) {
    return { value: "Double click to edit" };
  } else if (node.kind === AvailableNodeKind.Element) {
    return {
      value: `<${node.name}${
        isContainer(node.name) ? " " + ELEMENT_INSERT_ATTR : ""
      } />`,
    };
  } else if (node.kind === AvailableNodeKind.Instance) {
    return {
      value: `<inst.${node.name} />`,
      namespaces: {
        inst: node.sourceUri,
      },
    };
  }
};

const isContainer = (name: string) => !/^(input|select|br|hr)$/.test(name);

export const getStyleDeclarationEdit = ({
  payload: { declarationId },
}: VirtualStyleDeclarationValueChanged) => {};
