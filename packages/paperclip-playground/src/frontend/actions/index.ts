import * as ve from "paperclip-visual-editor/src/actions";
import { AppState } from "paperclip-visual-editor/src/state";
import { actionCreator } from "./base";

export type BaseAction<TType extends ActionType, TPayload = undefined> = {
  type: TType;
  payload: TPayload;
};

export enum ActionType {
  ENGINE_LOADED = "ENGINE_LOADED",
  ENGINE_CRASHED = "ENGINE_CRASHED",
  CODE_EDITOR_TEXT_CHANGED = "CODE_EDITOR_TEXT_CHANGED",
  WORKER_INITIALIZED = "WORKER_INITIALIZED",
  APP_STATE_DIFFED = "APP_STATE_DIFFED",
}

export type EngineLoaded = BaseAction<ActionType.ENGINE_LOADED>;

export type EngineCrashed = BaseAction<ActionType.ENGINE_CRASHED, Error>;
export type CodeEditorTextChanged = BaseAction<
  ActionType.CODE_EDITOR_TEXT_CHANGED,
  string
>;
export type WorkerInitialized = BaseAction<
  ActionType.WORKER_INITIALIZED,
  { appState: AppState }
>;
export type AppStateDiffed = BaseAction<
  ActionType.APP_STATE_DIFFED,
  { ops: any[] }
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
export const workerInitialized = actionCreator<WorkerInitialized>(
  ActionType.WORKER_INITIALIZED
);
export const appStateDiffed = actionCreator<AppStateDiffed>(
  ActionType.APP_STATE_DIFFED
);

export type Action =
  | ve.Action
  | EngineLoaded
  | EngineCrashed
  | AppStateDiffed
  | WorkerInitialized
  | CodeEditorTextChanged;
