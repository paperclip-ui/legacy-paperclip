import * as ve from "paperclip-designer/src/state";
import { isPaperclipFile, memoize, SourceLocation } from "paperclip-utils";
import * as qs from "querystring";
import mime from "mime-types";
import { mapValues, omit, pickBy } from "lodash";
const ENTRY_URI = "main.pc";
import bowser from "bowser";
import { ContentChange } from "paperclip-source-writer";

export type User = {
  avatarUrl?: string;
  email?: string;
  id: number;
};

const SUPPORTED_BROWSERS = [
  { name: "chrome", minVersion: 54 },
  { name: "firefox", minVersion: 38 },
  { name: "edge", minVersion: 79 }
];

// 2 MB
export const MAX_FILE_SIZE = 2 * 1000 * 1000;

export type Result<TData> = {
  data?: TData;
  done?: boolean;
  error?: Error;
};

export type Project = {
  id: number;
  name: string;
  owner: boolean;
  mainFilePath?: string;
  files: ProjectFile[];
  updatedAt: string;
};

export type ProjectFile = {
  id: number;
  path: string;
  url: string;
};

export const APP_LOCATIONS = {
  ROOT: "/",
  PROJECTS: "/projects",
  PROJECT: "/projects/:projectId",
  SHARED_PROJECT: "/s/:projectHash"
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
  currentProjectId?: number;
  canvasFile: string;
  documents: Record<string, string | Blob>;
};

export type ShareProjectInfo = {
  link: string;
};

export type AppState = {
  user?: Result<User>;
  currentProject?: Result<Project>;
  playgroundUi: {
    pathname: string;
    query: any;
  };
  currentContentChanges: ContentChange[];
  browserSupported?: boolean;
  progressLoadedPercent?: number;
  highlightLocation?: SourceLocation;
  shareProjectInfo?: Result<ShareProjectInfo>;
  currentCodeFilePath: string;
  allProjects?: Result<Project[]>;
  currentProjectFiles?: Result<Record<string, string | Buffer>>;
  saving?: Result<boolean>;
  hasUnsavedChanges?: boolean;
  compact?: boolean;
  slim?: boolean;
  apiHost: string;
} & ve.AppState;

export const INITIAL_STATE: AppState = {
  ...ve.INITIAL_STATE,
  currentContentChanges: [],
  shared: {
    documents: {
      [ENTRY_URI]: ""
    }
  },
  browserSupported: isBrowserSupported(),
  designer: {
    ...ve.INITIAL_STATE.designer,
    sharable: false,
    resourceHost: null,
    ui: {
      pathname: "/canvas",
      query: {
        canvasFile: ENTRY_URI
      }
    },
    syncLocationMode: ve.SyncLocationMode.Query,
    projectDirectory: {
      name: "/",
      kind: ve.FSItemKind.DIRECTORY,
      absolutePath: "/",
      url: "file://",
      children: []
    }
  },
  currentCodeFilePath: ENTRY_URI,
  playgroundUi: {
    pathname: "/",
    query: {}
  },
  compact: false,
  apiHost: process.env.API_HOST,
  slim: false
};
export const getNewFilePath = (name: string, previousNameOrExt: string) => {
  const ext = previousNameOrExt
    ? previousNameOrExt.split(".").pop()
    : name.includes(".")
    ? name.split(".").pop()
    : "pc";

  return cleanupPath(name.replace(/\.\w+$/, "") + "." + ext);
};

export const getWorkerState = (state: AppState): WorkerState => {
  return {
    currentProjectId: state.currentProject?.data?.id,
    canvasFile: state.designer.ui.query.canvasFile,
    documents: pickBy(
      mapValues(state.shared.documents, value => value.toString()),
      (content: string, uri: string) => {
        return typeof content === "string";
      }
    )
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

export const EDITABLE_MIME_TYPES = ["text/plain", "image/svg+xml", "text/css"];

const ALT_MIME_TYPES = [
  "application/vnd.ms-fontobject", // .eot
  "font/ttf",
  "font/woff",
  "font/woff2",
  "application/font-woff",
  "application/font-ttf",
  "application/font-woff2"
];

const MEDIA_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml",
  "video/quicktime",
  "video/mp4"
];
const PREVIEW_MIME_TYPES = [...MEDIA_MIME_TYPES, "text/plain", "image/svg+xml"];

const ACCEPTED_MIME_TYPES = [
  ...ALT_MIME_TYPES,
  ...MEDIA_MIME_TYPES,
  ...EDITABLE_MIME_TYPES
];

export const canUpload = (files: FileList) => {
  return Array.from(files).every(file => {
    if (file.size > MAX_FILE_SIZE) {
      return false;
    }

    return ACCEPTED_MIME_TYPES.includes(
      file.type || String(mime.lookup(file.name))
    );
  });
};

function isBrowserSupported() {
  if (typeof window === "undefined") {
    return false;
  }

  const info = bowser.parse(window.navigator.userAgent);

  return SUPPORTED_BROWSERS.some(browser => {
    return (
      browser.name === info.browser.name.toLowerCase() &&
      browser.minVersion < Number(info.browser.version.split(".").shift())
    );
  });
}

export const canEditFile = (name: string) => {
  if (isPaperclipFile(name)) {
    return true;
  }
  const type = String(mime.lookup(name));
  return EDITABLE_MIME_TYPES.includes(type);
};

export const canPreviewFile = (name: string) => {
  if (isPaperclipFile(name)) {
    return true;
  }

  const type = String(mime.lookup(name));

  return PREVIEW_MIME_TYPES.includes(type);
};

export const cleanupPath = (path: string) => {
  // just rel directory - no root defined
  return path.replace(/\w+:\/\//, "").replace(/\/+/, "/");
};
