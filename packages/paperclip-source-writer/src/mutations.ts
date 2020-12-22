import { SourceLocation, VirtJsObject, ExprSource } from "paperclip-utils";

export enum PCMutationActionKind {
  ANNOTATIONS_CHANGED = "ANNOTATIONS_CHANGED"
}

type BaseAction<TKind extends PCMutationActionKind> = {
  kind: PCMutationActionKind;
};

export type AnnotationsChanged = {
  annotations?: Record<string, any>;
  annotationsSource?: ExprSource;
} & BaseAction<PCMutationActionKind.ANNOTATIONS_CHANGED>;

export type PCMutationAction = AnnotationsChanged;

export type PCMutation = {
  nodeSource: ExprSource;
  action: PCMutationAction;
};
