import { PCDocument } from "@paperclip-ui/editor-engine/lib/client/documents";
import { PCDocumentContent } from "@paperclip-ui/editor-engine/lib/client/documents/pc";
import { EngineDelegateEvent } from "@paperclip-ui/utils";
import { Project } from "@tandem-ui/workspace-client/lib/project";
import { actionCreators, ExtractJoinedActionFromCreators } from "./util";

export const workspaceActions = actionCreators(
  {
    allFramesLoaded: (documents: PCDocument[]) => documents,
    projectLoaded: (project: Project) => project,
    pcContentUpdated: (payload: {
      uri: string;
      content: PCDocumentContent;
      event: EngineDelegateEvent;
    }) => payload,
  },
  "workspace"
);

export type WorkspaceAction = ExtractJoinedActionFromCreators<
  typeof workspaceActions
>;
