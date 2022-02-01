import { PCDocumentContent } from "@paperclip-ui/editor-engine/lib/client/documents/pc";
import { AvailableNode } from "@paperclip-ui/language-service";
import { LoadedPCData } from "@paperclip-ui/utils";
import { ProjectProperties } from "@tandem-ui/workspace-client/lib/project";
import {
  actionCreators,
  ExtractJoinedActionFromCreators,
  identity,
} from "./util";

export const workspaceActions = actionCreators(
  {
    framesLoaded: (payload: { uri: string; content: LoadedPCData }) => payload,
    allFramesLoaded: (documents: Record<string, LoadedPCData>) => documents,
    projectLoaded: (project: ProjectProperties) => project,
    insertableNodesLoaded: identity<AvailableNode[]>(),
    pcContentUpdated: (payload: { uri: string; content: PCDocumentContent }) =>
      payload,
  },
  "workspace"
);

export type WorkspaceAction = ExtractJoinedActionFromCreators<
  typeof workspaceActions
>;
