import * as React from "react";
import EditorView, {FilesPane as FilesPaneView, DisplayPane as DisplayPaneView} from "./index.pc";

function FilesPane() {
  return <FilesPaneView />
}

function DisplayPane() {
  return <FilesPaneView />
}

export function Editor() {
  return <div />
  // return <EditorView filesPane={<FilesPane />} displayPane={<DisplayPane />} />;
}