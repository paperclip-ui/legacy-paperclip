import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { Project } from "@tandem-ui/workspace-client/lib/project";
import { Action, mainActions, workspaceActions } from "../../../actions";
import { Store } from "../../base";

export class ProjectManager {
  private _mainProjectId: string;
  private _mainProject: Project;

  constructor(private _client: WorkspaceClient, private _store: Store) {}

  getMainProject() {
    return this._mainProject;
  }

  handleAction(action: Action) {
    switch (action.type) {
      case mainActions.locationChanged.type:
        return this._handleLocationChanged(action);
    }
  }

  private _handleLocationChanged(
    action: ReturnType<typeof mainActions.locationChanged>
  ) {
    const currentProjectId = action.payload.query.projectId;
    if (currentProjectId !== this._mainProjectId) {
      this._setProjectId(currentProjectId);
    }
  }

  private _setProjectId = async (id: string) => {
    const project = (this._mainProject = await this._client.openProject({
      id,
    }));
    this._store.dispatch(
      workspaceActions.projectLoaded(project.getProperties())
    );
  };
}
