import * as ve from "paperclip-visual-editor/src/actions";
import { actionCreator } from "./base";

export type BaseAction<TType extends ActionType, TPayload = undefined> = {
  type: TType;
  payload: TPayload;
};

export enum ActionType {
  ENGINE_LOADED = "ENGINE_LOADED",
  ENGINE_CRASHED = "ENGINE_CRASHED",
  CODE_EDITOR_TEXT_CHANGED = "CODE_EDITOR_TEXT_CHANGED",
}

export type EngineLoaded = BaseAction<ActionType.ENGINE_LOADED>;

export type EngineCrashed = BaseAction<ActionType.ENGINE_CRASHED, Error>;
export type CodeEditorTextChanged = BaseAction<
  ActionType.CODE_EDITOR_TEXT_CHANGED,
  string
>;

export const engineLoaded = actionCreator<EngineLoaded>(
  ActionType.ENGINE_LOADED
);
export const engineCrashed = actionCreator<EngineCrashed>(
  ActionType.ENGINE_CRASHED
);
export const codeEditorChanged = actionCreator<CodeEditorTextChanged>(
  ActionType.CODE_EDITOR_TEXT_CHANGED
);

export type Action =
  | ve.Action
  | EngineLoaded
  | EngineCrashed
  | CodeEditorTextChanged;
