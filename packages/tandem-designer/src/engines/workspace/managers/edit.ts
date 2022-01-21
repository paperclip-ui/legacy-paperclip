import { Action, ActionType } from "../../..";
import { ProjectManager } from "./project";
import { Store } from "../../base";
import {
  VirtualObjectEdit,
  VirtualobjectEditKind,
} from "@paperclip-ui/editor-engine/lib/core";
import { computeVirtScriptObject } from "@paperclip-ui/utils";
import { getFrameFromIndex } from "../../../state";

export class EditManager {
  constructor(private _pm: ProjectManager, private _store: Store) {}
  handleAction(action: Action) {
    console.log(action.type);
    switch (action.type) {
      case ActionType.RESIZER_STOPPED_MOVING:
      case ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING:
      case ActionType.FRAME_TITLE_CHANGED:
      case ActionType.GLOBAL_H_KEY_DOWN: {
        return this._updateNodeAnnotations();
      }
    }
  }

  private async _updateNodeAnnotations() {
    const state = this._store.getState();
    const project = this._pm.getMainProject();
    const document = await project
      .getDocuments()
      .open(state.designer.ui.query.canvasFile);

    const edits: VirtualObjectEdit[] = state.designer.selectedNodePaths.map(
      (nodePath) => {
        const frame = getFrameFromIndex(Number(nodePath), state.designer);
        if (!frame) {
          return null;
        }
        return {
          kind: VirtualobjectEditKind.SetAnnotations,
          nodePath,
          value: computeVirtScriptObject(frame.annotations),
        };
      }
    );

    console.log(edits);

    document.editVirtualObjects(edits);
  }
}
