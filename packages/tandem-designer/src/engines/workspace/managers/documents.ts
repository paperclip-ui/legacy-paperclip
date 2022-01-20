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
  constructor(
    private _client: WorkspaceClient,
    private _projectManager: ProjectManager,
    private _store: Store
  ) {}

  /**
   */

  handleAction(action: Action) {
    switch (action.type) {
      case workspaceActions.projectLoaded.type:
        return this._handleProjectLoaded();
    }
  }

  /**
   */

  private _handleProjectLoaded() {
    const project = this._projectManager.getMainProject();

    project.getDocuments().onDocumentChanged((document) => {
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
    const state = this._store.getState();

    if (!mainProject) {
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
