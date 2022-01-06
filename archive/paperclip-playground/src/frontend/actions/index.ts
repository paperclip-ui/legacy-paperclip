import * as ve from "tandem-designer/src/actions";
import {
  AppState,
  Project,
  ProjectFile,
  Result,
  ShareProjectInfo,
  User,
  WorkerState
} from "../state";
import { actionCreator } from "./base";
import { ContentChange } from "@paperclipui/source-writer";
import { KeyComboPressed } from "tandem-designer/src/actions";
import { AstEmitted } from "@paperclipui/utils";

export type BaseAction<TType extends ActionType, TPayload = undefined> = {
  type: TType;
  payload: TPayload;
};

export enum ActionType {
  PROJECT_HOOK_USED = "PROJECT_HOOK_USED",
  ALL_PROJECTS_HOOK_USED = "ALL_PROJECTS_HOOK_USED",
  PROJECT_FILES_HOOK_USED = "PROJECT_FILES_HOOK_USED",
  DELETE_PROJECT_CONFIRMED = "DELETE_PROJECT_CONFIRMED",
  DOWNLOAD_PROJECT_CLICKED = "DOWNLOAD_PROJECT_CLICKED",
  PROJECT_FILES_LOAD_PROGRESS_CHANGED = "PROJECT_FILES_LOAD_PROGRESS_CHANGED",
  SHARE_PROJECT_REQUEST_STATE_CHANGED = "SHARE_PROJECT_REQUEST_STATE_CHANGED",
  SHARE_MODAL_CLOSED = "SHARE_MODAL_CLOSED",
  SHARE_BUTTON_CLICKED = "SHARE_BUTTON_CLICKED",
  RAW_FILE_UPLOADED = "RAW_FILE_UPLOADED",
  FILES_DROPPED = "FILES_DROPPED",
  NEW_PROJECT_ENTERED = "NEW_PROJECT_ENTERED",
  REMOVE_FILE_CLICKED = "REMOVE_FILE_CLICKED",
  FILE_RENAMED = "FILE_RENAMED",
  PROJECT_RENAMED = "PROJECT_RENAMED",
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
  SESSION_REQUEST_STATE_CHANGED = "SESSION_REQUEST_STATE_CHANGED",
  CODE_EDITOR_TEXT_CHANGED = "CODE_EDITOR_TEXT_CHANGED",
  SLIM_CODE_EDITOR_TEXT_CHANGED = "SLIM_CODE_EDITOR_TEXT_CHANGED",
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
export type ShareModalClosed = BaseAction<ActionType.SHARE_MODAL_CLOSED>;
export type GetProjectRequestChanged = BaseRequestChanged<
  ActionType.GET_PROJECT_REQUEST_CHANGED,
  Project
>;
export type DownloadProjectClicked = BaseAction<
  ActionType.DOWNLOAD_PROJECT_CLICKED
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
export type RemoveFileClicked = BaseAction<
  ActionType.REMOVE_FILE_CLICKED,
  { uri: string }
>;
export type FileRenamed = BaseAction<
  ActionType.FILE_RENAMED,
  { uri: string; newUri: string }
>;
export type ProjectHookUsed = BaseAction<
  ActionType.PROJECT_HOOK_USED,
  { projectId: number }
>;
export type ProjectFilesLoadProgressChanged = BaseAction<
  ActionType.PROJECT_FILES_LOAD_PROGRESS_CHANGED,
  number
>;

export type RawFileUploaded = BaseAction<
  ActionType.RAW_FILE_UPLOADED,
  { data: Blob; path: string }
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

type TextEditChange = {
  rangeOffset: number;
  rangeLength: number;
  text: string;
};

export type EngineLoaded = BaseAction<ActionType.ENGINE_LOADED>;
export type ProjectRenamed = BaseAction<
  ActionType.PROJECT_RENAMED,
  { projectId: number; newName: string }
>;

export type LogoutButtonClicked = BaseAction<ActionType.LOGOUT_BUTTON_CLICKED>;
export type DeleteProjectConfirmed = BaseAction<
  ActionType.DELETE_PROJECT_CONFIRMED,
  { projectId: number }
>;
export type ShareProjectRequestStateChanged = BaseRequestChanged<
  ActionType.SHARE_PROJECT_REQUEST_STATE_CHANGED,
  ShareProjectInfo
>;
export type SaveButtonClicked = BaseAction<ActionType.SAVE_BUTTON_CLICKED, {}>;
export type EngineCrashed = BaseAction<ActionType.ENGINE_CRASHED, Error>;
export type CodeEditorTextChanged = BaseAction<
  ActionType.CODE_EDITOR_TEXT_CHANGED,
  TextEditChange[]
>;
export type SlimEditorTextChanged = BaseAction<
  ActionType.SLIM_CODE_EDITOR_TEXT_CHANGED,
  string
>;
export type SessionRequestStateChanged = BaseRequestChanged<
  ActionType.SESSION_REQUEST_STATE_CHANGED,
  User
>;

export type WorkerInitialized = BaseAction<
  ActionType.WORKER_INITIALIZED,
  { state: WorkerState }
>;
export type ShareButtonClicked = BaseAction<ActionType.SHARE_BUTTON_CLICKED>;

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
  { uri: string }
>;
export type SyncPanelsClicked = BaseAction<ActionType.SYNC_PANELS_CLICKED>;

export type FileItemClicked = BaseAction<
  ActionType.FILE_ITEM_CLICKED,
  { uri: string }
>;

export type NewProjectEntered = BaseAction<
  ActionType.NEW_PROJECT_ENTERED,
  { name: string }
>;

export type LoggedOut = BaseAction<ActionType.LOGGED_OUT>;
export type FilesDropped = BaseAction<ActionType.FILES_DROPPED, FileList>;

export const newProjectEntered = actionCreator<NewProjectEntered>(
  ActionType.NEW_PROJECT_ENTERED
);
export const shareProjectRequestStateChanged = actionCreator<
  ShareProjectRequestStateChanged
>(ActionType.SHARE_PROJECT_REQUEST_STATE_CHANGED);
export const rawFileUploaded = actionCreator<RawFileUploaded>(
  ActionType.RAW_FILE_UPLOADED
);
export const projectFilesLoadProgressChanged = actionCreator<
  ProjectFilesLoadProgressChanged
>(ActionType.PROJECT_FILES_LOAD_PROGRESS_CHANGED);
export const filesDropped = actionCreator<FilesDropped>(
  ActionType.FILES_DROPPED
);
export const downloadProjectClicked = actionCreator<DownloadProjectClicked>(
  ActionType.DOWNLOAD_PROJECT_CLICKED
);
export const accountConnected = actionCreator<AccountConnected>(
  ActionType.ACCOUNT_CONNECTED
);
export const logoutButtonClicked = actionCreator<LogoutButtonClicked>(
  ActionType.LOGOUT_BUTTON_CLICKED
);
export const shareButtonClicked = actionCreator<ShareButtonClicked>(
  ActionType.SHARE_BUTTON_CLICKED
);
export const removeFileClicked = actionCreator<RemoveFileClicked>(
  ActionType.REMOVE_FILE_CLICKED
);
export const fileRenamed = actionCreator<FileRenamed>(ActionType.FILE_RENAMED);
export const sessionRequestStateChanged = actionCreator<
  SessionRequestStateChanged
>(ActionType.SESSION_REQUEST_STATE_CHANGED);
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
export const slimCodeEditorChanged = actionCreator<SlimEditorTextChanged>(
  ActionType.SLIM_CODE_EDITOR_TEXT_CHANGED
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
export const shareModalClosed = actionCreator<ShareModalClosed>(
  ActionType.SHARE_MODAL_CLOSED
);
export const projectRenamed = actionCreator<ProjectRenamed>(
  ActionType.PROJECT_RENAMED
);
export const fileItemClicked = actionCreator<FileItemClicked>(
  ActionType.FILE_ITEM_CLICKED
);
export const deleteProjectConfirmed = actionCreator<DeleteProjectConfirmed>(
  ActionType.DELETE_PROJECT_CONFIRMED
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
  | SlimEditorTextChanged
  | DeleteProjectConfirmed
  | ProjectFilesLoadProgressChanged
  | LoggedOut
  | SessionRequestStateChanged
  | GetProjectsRequestChanged
  | AllProjectsHookUsed
  | ProjectFilesHookUsed
  | FilesDropped
  | ProjectHookUsed
  | ShareModalClosed
  | ShareProjectRequestStateChanged
  | FileRenamed
  | RemoveFileClicked
  | GetProjectRequestChanged
  | AstEmitted
  | GetProjectFilesRequestChanged
  | EngineCrashed
  | AppStateDiffed
  | DownloadProjectClicked
  | RawFileUploaded
  | NewProjectEntered
  | SavedProject
  | FileItemClicked
  | ShareButtonClicked
  | ProjectRenamed
  | SyncPanelsClicked
  | NewFileNameEntered
  | WorkerInitialized
  | ContentChangesCreated
  | CodeEditorTextChanged;
