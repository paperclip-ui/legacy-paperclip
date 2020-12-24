import { SourceLocation, VirtJsObject, ExprSource } from "paperclip-utils";

export enum PCMutationActionKind {
  ANNOTATIONS_CHANGED = "ANNOTATIONS_CHANGED",
  EXPRESSION_DELETED = "EXPRESSION_DELETED"
}

type BaseAction<TKind extends PCMutationActionKind> = {
  kind: TKind;
};

export type AnnotationsChanged = {
  annotations?: Record<string, any>;
  annotationsSource?: ExprSource;
} & BaseAction<PCMutationActionKind.ANNOTATIONS_CHANGED>;

export type ExpressionDeleted = {} & BaseAction<
  PCMutationActionKind.EXPRESSION_DELETED
>;

export type PCMutationAction = AnnotationsChanged | ExpressionDeleted;

export type PCMutation = {
  exprSource: ExprSource;
  action: PCMutationAction;
};
