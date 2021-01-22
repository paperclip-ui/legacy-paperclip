import * as ve from "paperclip-designer/src/actions";
import { AppState, Project, ProjectFile, Result, User } from "../state";
import { actionCreator } from "./base";
import { ContentChange } from "paperclip-source-writer";

export type BaseAction<TType extends ActionType, TPayload = undefined> = {
  type: TType;
  payload: TPayload;
};

export enum ActionType {
  PROJECT_HOOK_USED = "PROJECT_HOOK_USED",
  ALL_PROJECTS_HOOK_USED = "ALL_PROJECTS_HOOK_USED",
  PROJECT_FILES_HOOK_USED = "PROJECT_FILES_HOOK_USED",
  REQUEST_CHANGED = "REQUEST_CHANGED",
  ENGINE_LOADED = "ENGINE_LOADED",
  GET_PROJECTS_REQUEST_CHANGED = "GET_PROJECTS_REQUEST_CHANGED",
  GET_PROJECT_REQUEST_CHANGED = "GET_PROJECT_REQUEST_CHANGED",
  GET_PROJECT_FILES_REQUEST_CHANGED = "GET_PROJECT_FILES_REQUEST_CHANGED",
  LOGOUT_BUTTON_CLICKED = "LOGOUT_BUTTON_CLICKED",
  ENGINE_CRASHED = "ENGINE_CRASHED",
  SAVED_PROJECT = "SAVED_PROJECT",
  SAVE_BUTTON_CLICKED = "SAVE_BUTTON_CLICKED",
  LOGGED_OUT = "LOGGED_OUT",
  SESSION_LOADED = "SESSION_LOADED",
  CODE_EDITOR_TEXT_CHANGED = "CODE_EDITOR_TEXT_CHANGED",
  WORKER_INITIALIZED = "WORKER_INITIALIZED",
  APP_STATE_DIFFED = "APP_STATE_DIFFED",
  CONTENT_CHANGES_CREATED = "CONTENT_CHANGES_CREATED",
  FILE_ITEM_CLICKED = "FILE_ITEM_CLICKED",
  NEW_FILE_NAME_ENTERED = "NEW_FILE_NAME_ENTERED",
  SYNC_PANELS_CLICKED = "SYNC_PANELS_CLICKED",
  ACCOUNT_CONNECTED = "ACCOUNT_CONNECTED"
}

export enum AccountKind {
  Google = "google",
  GitHub = "github"
}

export type BaseRequestChanged<
  TType extends ActionType,
  TData,
  TPayload = {}
> = BaseAction<TType, { result: Result<TData> } & TPayload>;

export type GetProjectsRequestChanged = BaseRequestChanged<
  ActionType.GET_PROJECTS_REQUEST_CHANGED,
  Project[]
>;
export type GetProjectRequestChanged = BaseRequestChanged<
  ActionType.GET_PROJECT_REQUEST_CHANGED,
  Project
>;
export type GetProjectFilesRequestChanged = BaseRequestChanged<
  ActionType.GET_PROJECT_FILES_REQUEST_CHANGED,
  Record<string, string>,
  { projectId: number }
>;
export type ProjectFilesHookUsed = BaseAction<
  ActionType.PROJECT_FILES_HOOK_USED,
  { projectId: number }
>;
export type ProjectHookUsed = BaseAction<
  ActionType.PROJECT_HOOK_USED,
  { projectId: number }
>;
export type AllProjectsHookUsed = BaseAction<ActionType.ALL_PROJECTS_HOOK_USED>;

export type AccountConnected = BaseAction<
  ActionType.ACCOUNT_CONNECTED,
  {
    kind: AccountKind;

    // for the backend, FE is just a trampoline
    details: any;
  }
>;

export type SavedProject = BaseAction<
  ActionType.SAVED_PROJECT,
  Result<boolean>
>;

export type EngineLoaded = BaseAction<ActionType.ENGINE_LOADED>;

export type LogoutButtonClicked = BaseAction<ActionType.LOGOUT_BUTTON_CLICKED>;

export type SaveButtonClicked = BaseAction<ActionType.SAVE_BUTTON_CLICKED>;

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
export const savedProject = actionCreator<SavedProject>(
  ActionType.SAVED_PROJECT
);
export const loggedOut = actionCreator<LoggedOut>(ActionType.LOGGED_OUT);
export const engineLoaded = actionCreator<EngineLoaded>(
  ActionType.ENGINE_LOADED
);
export const engineCrashed = actionCreator<EngineCrashed>(
  ActionType.ENGINE_CRASHED
);
export const saveButtonClicked = actionCreator<SaveButtonClicked>(
  ActionType.SAVE_BUTTON_CLICKED
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

export const getProjectRequestChanged = actionCreator<GetProjectRequestChanged>(
  ActionType.GET_PROJECT_REQUEST_CHANGED
);

export const getProjectsRequestChanged = actionCreator<
  GetProjectsRequestChanged
>(ActionType.GET_PROJECTS_REQUEST_CHANGED);
export const getProjectFilesRequestChanged = actionCreator<
  GetProjectFilesRequestChanged
>(ActionType.GET_PROJECT_FILES_REQUEST_CHANGED);
export const projectHookUsed = actionCreator<ProjectHookUsed>(
  ActionType.PROJECT_HOOK_USED
);
export const projectFilesHookUsed = actionCreator<ProjectFilesHookUsed>(
  ActionType.PROJECT_FILES_HOOK_USED
);
export const allProjectsHookUsed = actionCreator<AllProjectsHookUsed>(
  ActionType.ALL_PROJECTS_HOOK_USED
);

export type Action =
  | ve.Action
  | LogoutButtonClicked
  | EngineLoaded
  | AccountConnected
  | SaveButtonClicked
  | LoggedOut
  | SessionLoaded
  | GetProjectsRequestChanged
  | AllProjectsHookUsed
  | ProjectFilesHookUsed
  | ProjectHookUsed
  | GetProjectRequestChanged
  | GetProjectFilesRequestChanged
  | EngineCrashed
  | AppStateDiffed
  | SavedProject
  | FileItemClicked
  | SyncPanelsClicked
  | NewFileNameEntered
  | WorkerInitialized
  | ContentChangesCreated
  | CodeEditorTextChanged;
