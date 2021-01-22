import * as ve from "paperclip-designer/src/state";
import { memoize } from "paperclip-utils";
import * as qs from "querystring";

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

export type AppState = {
  user?: User;
  currentProject?: Result<Project>;
  playgroundUi: {
    pathname: string;
    query: any;
  };
  allProjects?: Result<Project[]>;
  currentProjectFiles?: Result<ProjectFile[]>;
  saving?: Result<boolean>;
  loadingUserSession?: boolean;
  currentCodeFileUri: string;
  hasUnsavedChanges?: boolean;
  compact?: boolean;
  slim?: boolean;
  apiHost: string;
} & ve.AppState;

const ENTRY_SOURCE = ``;

export const INITIAL_STATE: AppState = {
  ...ve.INITIAL_STATE,
  shared: {
    documents: {
      [ENTRY_URI]: ENTRY_SOURCE
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
  currentCodeFileUri: ENTRY_URI,
  compact: false,
  apiHost: process.env.API_HOST,
  slim: false
};
export const getNewFilePath = (name: string) => {
  return "file:///" + name.replace(".pc", "") + ".pc";
};
