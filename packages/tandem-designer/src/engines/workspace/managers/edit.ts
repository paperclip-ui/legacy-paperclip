import { Action, ActionType } from "../../..";
import { ProjectManager } from "./project";
import { Store } from "../../base";
import {
  VirtualObjectEdit,
  VirtualobjectEditKind,
} from "@paperclip-ui/editor-engine/lib/core";
import { computeVirtScriptObject } from "@paperclip-ui/utils";
import { DesignerState, getFrameFromIndex } from "../../../state";

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
      kind: VirtualobjectEditKind.SetAnnotations,
      nodePath,
      value: computeVirtScriptObject(frame.annotations),
    };
  });
};

const getDeletionEdit = (state: DesignerState): VirtualObjectEdit[] => {
  return state.selectedNodePaths.map((nodePath) => {
    return {
      kind: VirtualobjectEditKind.DeleteNode,
      nodePath,
    };
  });
};
