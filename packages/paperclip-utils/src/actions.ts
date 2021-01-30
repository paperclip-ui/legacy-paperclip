import { Node } from "./ast";
import { EngineDelegateEvent } from "./events";
import { DependencyContent } from "./graph";

export enum BasicPaperclipActionType {
  AST_REQUESTED = "AST_REQUESTED",
  AST_EMITTED = "AST_EMITTED",
  ENGINE_DELEGATE_CHANGED = "ENGINE_DELEGATE_CHANGED",
  PREVIEW_CONTENT = "PREVIEW_CONTENT"
}

export const actionCreator = <TAction extends BaseAction<any, any>>(
  type: TAction["type"]
) => (payload: TAction["payload"]) => ({
  type,
  payload
});

type BaseAction<TType = BasicPaperclipActionType, TPayload = undefined> = {
  type: TType;
  payload: TPayload;
};

export type AstRequested = BaseAction<
  BasicPaperclipActionType.AST_REQUESTED,
  { uri: string }
>;
export type PreviewContent = BaseAction<
  BasicPaperclipActionType.PREVIEW_CONTENT,
  { uri: string; value: string }
>;
export type AstEmitted = BaseAction<
  BasicPaperclipActionType.AST_EMITTED,
  { uri: string; content: DependencyContent }
>;

export type EngineDelegateChanged = BaseAction<
  BasicPaperclipActionType.ENGINE_DELEGATE_CHANGED,
  EngineDelegateEvent
>;

export const astEmitted = actionCreator<AstEmitted>(
  BasicPaperclipActionType.AST_EMITTED
);
export const astRequested = actionCreator<AstRequested>(
  BasicPaperclipActionType.AST_REQUESTED
);
export const previewContent = actionCreator<PreviewContent>(
  BasicPaperclipActionType.PREVIEW_CONTENT
);
export const engineDelegateChanged = actionCreator<EngineDelegateChanged>(
  BasicPaperclipActionType.ENGINE_DELEGATE_CHANGED
);

export type BasicPaperclipAction =
  | AstEmitted
  | AstRequested
  | EngineDelegateChanged
  | PreviewContent;
