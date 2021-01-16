import * as ve from "paperclip-visual-editor/src/state";

export type AppState = {
  openFileUris: string[];
} & ve.AppState;

export const INITIAL_STATE: AppState = {
  ...ve.INITIAL_STATE,
  ui: {
    pathname: "/canvas",
    query: {
      currentFileUri: "file:///entry.pc",
    },
  },
  openFileUris: ["file:///entry.pc"],
  syncLocationWithUI: false,
  documentContents: {
    "file:///entry.pc": `Hello World`,
  },
};
