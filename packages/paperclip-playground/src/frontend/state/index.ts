import * as ve from "paperclip-visual-editor/src/state";

const ENTRY_URI = "file:///main.pc";

export type AppState = {
  currentCodeFileUri: string;
  compact?: boolean;
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
