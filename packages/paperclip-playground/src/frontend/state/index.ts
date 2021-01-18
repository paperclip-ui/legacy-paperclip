import * as ve from "paperclip-visual-editor/src/state";

const ENTRY_URI = "file:///main.pc";

export type User = {
  avatarUrl?: string;
  email?: string;
  id: number;
};

export type Result<TData> = {
  data?: TData;
  done?: boolean;
  error?: Error;
};

export type Project = {
  id: number;
  name: string;
};

export type AppState = {
  user?: User;
  project?: Project;
  saving?: Result<boolean>;
  loadingUserSession?: boolean;
  currentCodeFileUri: string;
  hasUnsavedChanges?: boolean;
  compact?: boolean;
  slim?: boolean;
  apiHost: string;
} & ve.AppState;

const ENTRY_SOURCE = `<div>
  <style>
    font-family: sans-serif;
    font-size: 24px;
  </style>

  Welcome to Paperclip!
</div>`;

export const INITIAL_STATE: AppState = {
  ...ve.INITIAL_STATE,
  sharable: false,
  compact: false,
  apiHost: process.env.API_HOST,
  slim: true,
  ui: {
    pathname: "/canvas",
    query: {
      currentFileUri: ENTRY_URI,
    },
  },
  currentCodeFileUri: ENTRY_URI,
  syncLocationWithUI: false,
  documentContents: {
    [ENTRY_URI]: ENTRY_SOURCE,
  },
  projectDirectory: {
    name: "/",
    kind: ve.FSItemKind.DIRECTORY,
    absolutePath: "/",
    url: "file://",
    children: [],
  },
};
export const getNewFilePath = (name: string) => {
  return "file:///" + name.replace(".pc", "") + ".pc";
};
