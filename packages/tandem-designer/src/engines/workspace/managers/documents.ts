import { WorkspaceClient } from "@tandem-ui/workspace-client";
import {
  Action,
  workspaceActions,
  mainActions,
  ActionType,
} from "../../../actions";
import { Store } from "../../base";
import { ProjectManager } from "./project";

export class DocumentsManager {
  private _showAll: boolean;

  constructor(
    private _client: WorkspaceClient,
    private _projectManager: ProjectManager,
    private _store: Store
  ) {}

  /**
   */

  handleAction(action: Action) {
    switch (action.type) {
      case mainActions.locationChanged.type:
        return this._handleLocationChanged(action);
      case workspaceActions.projectLoaded.type:
        return this._handleProjectLoaded();
    }
  }

  /**
   */

  private _handleLocationChanged(
    action: ReturnType<typeof mainActions.locationChanged>
  ) {
    this._showAll = action.payload.query.showAll !== false;
    this._maybeLoadAllDocuments();
  }

  /**
   */

  private _handleProjectLoaded() {
    const project = this._projectManager.getMainProject();

    project.getDocuments().onDocumentChanged((document) => {
      console.log("CHANGED!");
      this._store.dispatch(
        workspaceActions.pcContentUpdated({
          uri: document.uri,
          content: document.getContent(),
        })
      );
    });

    this._maybeLoadAllDocuments();
  }

  /**
   */

  private async _maybeLoadAllDocuments() {
    const mainProject = this._projectManager.getMainProject();

    if (!this._showAll || !mainProject) {
      return;
    }

    const docs = await mainProject.openAllPaperclipDocuments();

    const contents = {};
    for (const doc of docs) {
      contents[doc.uri] = doc.getContent();
    }

    this._store.dispatch(workspaceActions.allFramesLoaded(contents));
  }
}
