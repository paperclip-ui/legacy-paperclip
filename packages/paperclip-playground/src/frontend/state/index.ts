import * as ve from "paperclip-visual-editor/src/state";

export type AppState = {
  openFileUris: string[];
} & ve.AppState;

export const INITIAL_STATE: AppState = {
  ...ve.INITIAL_STATE,
  openFileUris: ["file:///entry.pc"],
  documentContents: {
    "file:///entry.pc": `Hello World`,
  },
};
