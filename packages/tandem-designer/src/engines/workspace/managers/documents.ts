import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { timeStamp } from "console";
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
      case workspaceActions.projectLoaded.type:
        return this._handleProjectLoaded();
      case mainActions.locationChanged.type:
        return this._maybeLoadAllDocuments();
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
    const showAll = state.designer.ui.query.showAll;

    if (!mainProject) {
      return;
    }

    if (!showAll || showAll === this._showAll) {
      this._showAll = showAll;
      return;
    }

    this._showAll = showAll;

    try {
      const docs = await mainProject.openAllPaperclipDocuments();
      const contents = {};
      for (const doc of docs) {
        contents[doc.uri] = doc.getContent();
      }

      this._store.dispatch(workspaceActions.allFramesLoaded(contents));
    } catch (e) {
      console.error(e.stack);
    }
  }
}
