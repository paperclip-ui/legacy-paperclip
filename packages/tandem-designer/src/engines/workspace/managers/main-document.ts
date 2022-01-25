import { Action, mainActions, workspaceActions } from "../../..";
import { Store } from "../../base";
import { ProjectManager } from "./project";

export class MainDocumentManager {
  constructor(private _store: Store, private _projectManager: ProjectManager) {}
  handleAction(action: Action) {
    switch (action.type) {
      case mainActions.locationChanged.type:
      case workspaceActions.projectLoaded.type: {
        this._maybeLoadMainDocument();
      }
    }
  }
  private async _maybeLoadMainDocument() {
    const state = this._store.getState();
    const canvasFile = state.designer.ui.query.canvasFile;
    const mainProject = this._projectManager.getMainProject();
    if (!canvasFile || !mainProject) {
      return;
    }

    const document = await mainProject.getDocuments().open(canvasFile);
    this._store.dispatch(
      workspaceActions.framesLoaded({
        uri: canvasFile,
        content: document.getContent(),
      })
    );
  }
}
