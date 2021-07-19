export enum PCMutationActionKind {
  ANNOTATIONS_CHANGED = "ANNOTATIONS_CHANGED",
  EXPRESSION_DELETED = "EXPRESSION_DELETED",
  CSS_DECLARATION_CHANGED = "CSS_DECLARATION_CHANGED"
}

type BaseAction<TKind extends PCMutationActionKind> = {
  kind: TKind;
};

export type AnnotationsChanged = {
  annotations?: Record<string, any>;
} & BaseAction<PCMutationActionKind.ANNOTATIONS_CHANGED>;

export type CSSDeclarationChanged = {
  name: string;
  value: string;
} & BaseAction<PCMutationActionKind.CSS_DECLARATION_CHANGED>;

export type ExpressionDeleted = {} & BaseAction<
  PCMutationActionKind.EXPRESSION_DELETED
>;

export type PCMutationAction =
  | AnnotationsChanged
  | ExpressionDeleted
  | CSSDeclarationChanged;

export type PCMutation = {
  targetId: string;
  action: PCMutationAction;
};
