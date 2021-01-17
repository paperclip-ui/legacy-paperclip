import * as ve from "paperclip-visual-editor/src/actions";
import { AppState } from "../state";
import { actionCreator } from "./base";
import { ContentChange } from "paperclip-source-writer";

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
  CONTENT_CHANGES_CREATED = "CONTENT_CHANGES_CREATED",
  FILE_ITEM_CLICKED = "FILE_ITEM_CLICKED",
  NEW_FILE_NAME_ENTERED = "NEW_FILE_NAME_ENTERED",
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
export type ContentChangesCreated = BaseAction<
  ActionType.CONTENT_CHANGES_CREATED,
  { changes: Record<string, ContentChange[]> }
>;
export type NewFileNameEntered = BaseAction<
  ActionType.NEW_FILE_NAME_ENTERED,
  { value: string }
>;
export type FileItemClicked = BaseAction<
  ActionType.FILE_ITEM_CLICKED,
  { uri: string }
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
export const contentChangesCreated = actionCreator<ContentChangesCreated>(
  ActionType.CONTENT_CHANGES_CREATED
);
export const newFileNameEntered = actionCreator<NewFileNameEntered>(
  ActionType.NEW_FILE_NAME_ENTERED
);
export const fileItemClicked = actionCreator<FileItemClicked>(
  ActionType.FILE_ITEM_CLICKED
);

export type Action =
  | ve.Action
  | EngineLoaded
  | EngineCrashed
  | AppStateDiffed
  | FileItemClicked
  | NewFileNameEntered
  | WorkerInitialized
  | ContentChangesCreated
  | CodeEditorTextChanged;
