import * as ve from "paperclip-visual-editor/src/actions";
import { AppState, User } from "../state";
import { actionCreator } from "./base";
import { ContentChange } from "paperclip-source-writer";

export type BaseAction<TType extends ActionType, TPayload = undefined> = {
  type: TType;
  payload: TPayload;
};

export enum ActionType {
  ENGINE_LOADED = "ENGINE_LOADED",
  LOGOUT_BUTTON_CLICKED = "LOGOUT_BUTTON_CLICKED",
  ENGINE_CRASHED = "ENGINE_CRASHED",
  LOGGED_OUT = "LOGGED_OUT",
  SESSION_LOADED = "SESSION_LOADED",
  CODE_EDITOR_TEXT_CHANGED = "CODE_EDITOR_TEXT_CHANGED",
  WORKER_INITIALIZED = "WORKER_INITIALIZED",
  APP_STATE_DIFFED = "APP_STATE_DIFFED",
  CONTENT_CHANGES_CREATED = "CONTENT_CHANGES_CREATED",
  FILE_ITEM_CLICKED = "FILE_ITEM_CLICKED",
  NEW_FILE_NAME_ENTERED = "NEW_FILE_NAME_ENTERED",
  SYNC_PANELS_CLICKED = "SYNC_PANELS_CLICKED",
  ACCOUNT_CONNECTED = "ACCOUNT_CONNECTED",
}

export enum AccountKind {
  Google = "google",
  GitHub = "github",
}

export type AccountConnected = BaseAction<
  ActionType.ACCOUNT_CONNECTED,
  {
    kind: AccountKind;

    // for the backend, FE is just a trampoline
    details: any;
  }
>;

export type EngineLoaded = BaseAction<ActionType.ENGINE_LOADED>;

export type LogoutButtonClicked = BaseAction<ActionType.LOGOUT_BUTTON_CLICKED>;

export type EngineCrashed = BaseAction<ActionType.ENGINE_CRASHED, Error>;
export type CodeEditorTextChanged = BaseAction<
  ActionType.CODE_EDITOR_TEXT_CHANGED,
  string
>;
export type SessionLoaded = BaseAction<ActionType.SESSION_LOADED, User>;

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
export type SyncPanelsClicked = BaseAction<ActionType.SYNC_PANELS_CLICKED>;

export type FileItemClicked = BaseAction<
  ActionType.FILE_ITEM_CLICKED,
  { uri: string }
>;

export type LoggedOut = BaseAction<ActionType.LOGGED_OUT>;

export const accountConnected = actionCreator<AccountConnected>(
  ActionType.ACCOUNT_CONNECTED
);
export const logoutButtonClicked = actionCreator<LogoutButtonClicked>(
  ActionType.LOGOUT_BUTTON_CLICKED
);
export const sessionLoaded = actionCreator<SessionLoaded>(
  ActionType.SESSION_LOADED
);
export const loggedOut = actionCreator<LoggedOut>(ActionType.LOGGED_OUT);
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
export const syncPanelsClicked = actionCreator<SyncPanelsClicked>(
  ActionType.SYNC_PANELS_CLICKED
);

export type Action =
  | ve.Action
  | LogoutButtonClicked
  | EngineLoaded
  | AccountConnected
  | LoggedOut
  | SessionLoaded
  | EngineCrashed
  | AppStateDiffed
  | FileItemClicked
  | SyncPanelsClicked
  | NewFileNameEntered
  | WorkerInitialized
  | ContentChangesCreated
  | CodeEditorTextChanged;
