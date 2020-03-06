import * as React from "react";
import EditorView from "./template.pc";
import { FilesPane } from "./file-pane";
import { OpenFile } from "../state";
import { DisplayPane } from "./display-pane";

export function Editor() {
  const openFiles: OpenFile[] = [
    { name: "a.pc", content: "ok"}
  ];
  return <EditorView filesPane={<FilesPane files={openFiles} />} displayPane={<DisplayPane />} />;
}