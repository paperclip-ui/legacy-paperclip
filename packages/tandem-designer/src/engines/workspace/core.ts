import { ImmutableStore } from "@paperclip-ui/common";
import { PCDocument } from "@paperclip-ui/editor-engine/lib/client/documents";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { Project } from "@tandem-ui/workspace-client/lib/project";
import { Dispatch } from "redux";
import { Action } from "../..";
import { AppState } from "../../state";
import { Store } from "../base";

export type WorkspaceEngineState = {
  previousAppState?: AppState;
  currentAppState: AppState;
  currentProject?: Project;
  allDocuments?: PCDocument[];
  currentProjectId?: string;
  showAllScreens?: boolean;
};

export type Kernel = {
  localStore: ImmutableStore<WorkspaceEngineState>;
  globalStore: Store;
  client: WorkspaceClient;
  dispatch: Dispatch<Action>;
};
