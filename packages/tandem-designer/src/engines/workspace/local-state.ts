import { Action, ActionType } from "../..";
import { workspaceActions } from "../../actions/workspace-actions";
import { Kernel } from "./core";

export const manageLocalState = (state: Kernel) => {
  return (action: Action) => {
    switch (action.type) {
      case ActionType.LOCATION_CHANGED: {
        return state.localStore.update((state) => {
          state.showAllScreens = Boolean(action.payload.query.showAll);
          state.currentProjectId = action.payload.query.projectId;
        });
      }
      case workspaceActions.projectLoaded.type: {
        return state.localStore.update((state) => {
          state.currentProject = action.payload;
        });
      }
      case workspaceActions.allFramesLoaded.type: {
        return state.localStore.update((state) => {
          state.allDocuments = action.payload;
        });
      }
    }
  };
};
