import { InstanceAction } from "./instance-actions";
import { ServerAction } from "./server-actions";
import { ContentChanged, OpenedDocument } from "./external-actions";
import { WorkspaceAction } from "./workspace-actions";
import { UIActions } from "./ui-actions";

export * from "./instance-actions";
export * from "./server-actions";
export * from "./external-actions";
export * from "./workspace-actions";
export * from "./ui-actions";

export type Action =
  | InstanceAction
  | ServerAction
  | ContentChanged
  | OpenedDocument
  | UIActions
  | WorkspaceAction;
