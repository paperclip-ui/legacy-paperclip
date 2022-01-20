import { PCDocument } from "@paperclip-ui/editor-engine/lib/client/documents";
import { PCDocumentContent } from "@paperclip-ui/editor-engine/lib/client/documents/pc";
import { EngineDelegateEvent, LoadedPCData } from "@paperclip-ui/utils";
import {
  Project,
  ProjectProperties,
} from "@tandem-ui/workspace-client/lib/project";
import { actionCreators, ExtractJoinedActionFromCreators } from "./util";

export const workspaceActions = actionCreators(
  {
    allFramesLoaded: (documents: Record<string, LoadedPCData>) => documents,
    projectLoaded: (project: ProjectProperties) => project,
    pcContentUpdated: (payload: { uri: string; content: PCDocumentContent }) =>
      payload,
  },
  "workspace"
);

export type WorkspaceAction = ExtractJoinedActionFromCreators<
  typeof workspaceActions
>;
