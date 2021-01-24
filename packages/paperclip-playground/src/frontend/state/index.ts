import * as ve from "paperclip-designer/src/state";
import { isPaperclipFile, memoize } from "paperclip-utils";
import * as qs from "querystring";
import mime from "mime-types";



import Automerge from "automerge";
import { mapValues, omit, pickBy } from "lodash";
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
  mainFileUri?: string;
  files: ProjectFile[];
  updatedAt: string;
};

export type ProjectFile = {
  id: number;
  path: string;
  url: string;
};

export const APP_LOCATIONS = {
  PROJECTS: "/projects",
  PROJECT: "/projects/:projectId"
};

export const matchesLocationPath = (pathname: string, test: string) => {
  return Boolean(pathname.match(getPathnameRegexp(test)));
};

export const getLocationParams = (pathname: string, test: string) => {
  return pathname.match(getPathnameRegexp(test))?.groups;
};

const getPathnameRegexp = memoize((test: string) => {
  return new RegExp(`^${test}/*$`.replace(/:([^\/]+)/, "(?<$1>[^/]+)"));
});

/**
 * State that's also recorded with CRDTs -- needs
 * to be synced with undo / redo stack
 */

export type WorkerState = {
  currentFileUri: string;
  documents: Record<string, string | Blob>;
};

export type AppState = {
  user?: User;
  currentProject?: Result<Project>;
  playgroundUi: {
    pathname: string;
    query: any;
  };
  currentCodeFileUri: string;
  allProjects?: Result<Project[]>;
  currentProjectFiles?: Result<ProjectFile[]>;
  saving?: Result<boolean>;
  loadingUserSession?: boolean;
  hasUnsavedChanges?: boolean;
  compact?: boolean;
  slim?: boolean;
  apiHost: string;
} & ve.AppState;

export const INITIAL_STATE: AppState = {
  ...ve.INITIAL_STATE,
  shared: {
    documents: {
      [ENTRY_URI]: ""
    }
  },
  designer: {
    ...ve.INITIAL_STATE.designer,
    sharable: false,
    ui: {
      pathname: "/canvas",
      query: {
        currentFileUri: ENTRY_URI
      }
    },
    syncLocationWithUI: false,
    projectDirectory: {
      name: "/",
      kind: ve.FSItemKind.DIRECTORY,
      absolutePath: "/",
      url: "file://",
      children: []
    }
  },
  currentCodeFileUri: ENTRY_URI,
  playgroundUi:
    typeof window !== "undefined"
      ? {
          pathname: window.location.pathname,
          query: qs.parse(window.location.search.substr(1))
        }
      : {
          pathname: "/",
          query: {}
        },
  compact: false,
  apiHost: process.env.API_HOST,
  slim: false
};
export const getNewFilePath = (name: string, previousNameOrExt: string) => {

  const ext = previousNameOrExt ? previousNameOrExt.split(".").pop() :name.includes(".") ? name.split(".").pop() : "pc";

  return "file:///" + name.replace(".pc", "") + "." + ext;
};

export const getWorkerState = (state: AppState): WorkerState => {
  
  return {
    currentFileUri: state.designer.ui.query.currentFileUri,
    documents: pickBy(mapValues(state.shared.documents, value => value.toString()), (content: string, uri: string) => {
      return typeof content === "string";
    })
  };
};

export const hasUnsavedChanges = (state: AppState, prevState: AppState) => {
  for (const key in state.shared.documents) {
    if (
      prevState.shared.documents[key].toString() !==
      state.shared.documents[key].toString()
    ) {
      return true;
    }
  }
  for (const key in prevState.shared.documents) {
    if (
      prevState.shared.documents[key].toString() !==
      state.shared.documents[key].toString()
    ) {
      return true;
    }
  }

  return false;
};

export const EDITABLE_MIME_TYPES = [
  "text/plain",
  "image/svg+xml"
];

const MEDIA_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml"
];

const ACCEPTED_MIME_TYPES = [
  ...MEDIA_MIME_TYPES,
  ...EDITABLE_MIME_TYPES
];

export const canUpload = (files: FileList) => {
  return Array.from(files).every(file => {
    console.log(file.size);
    return ACCEPTED_MIME_TYPES.includes(file.type);
  });
};


export const canEditFile = (name: string) => {
  if (isPaperclipFile(name)) {
    return true;
  }
  const type = String(mime.lookup(name));

  return EDITABLE_MIME_TYPES.includes(type);
}


export const canPreviewFile = (name: string) => {
  if (isPaperclipFile(name)) {
    return true;
  }

  const type = String(mime.lookup(name));

  return ACCEPTED_MIME_TYPES.includes(type);
}