import { SourceLocation, VirtJsObject, ExprSource } from "paperclip-utils";

export enum PCMutationActionKind {
  ANNOTATIONS_CHANGED = "ANNOTATIONS_CHANGED"
}

type BaseAction<TKind extends PCMutationActionKind> = {
  kind: PCMutationActionKind;
};

export type AnnotationsChanged = {
  annotations?: Record<string, any>;
} & BaseAction<PCMutationActionKind.ANNOTATIONS_CHANGED>;

export type PCMutationAction = AnnotationsChanged;

export type PCMutation = {
  source: ExprSource;
  action: PCMutationAction;
};
