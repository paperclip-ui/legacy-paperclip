import { WorkspaceClient } from "@tandem-ui/workspace-client";
import * as qs from "querystring";
import { Project } from "@tandem-ui/workspace-client/lib/project";
import {
  Action,
  ActionType,
  mainActions,
  workspaceActions,
} from "../../../actions";
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
      case ActionType.POPOUT_BUTTON_CLICKED: {
        return this._popoutWindow();
      }
    }
  }

  private _popoutWindow() {
    const state = this._store.getState();
    this._mainProject.openNewWindow(
      "?" + qs.stringify(state.designer.ui.query)
    );
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
    this._mainProjectId = id;
    const project = (this._mainProject = await this._client.openProject({
      id,
    }));
    this._store.dispatch(
      workspaceActions.projectLoaded(project.getProperties())
    );
  };
}
