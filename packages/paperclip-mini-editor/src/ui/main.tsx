import * as React from "react";
import {useState} from "react";
import EditorView from "./template.pc";
import { FilesPane } from "./file-pane";
import { OpenFile } from "../state";
import { DisplayPane } from "./display-pane";

type Props = {
  files: OpenFile[]
};

export function Editor(props: Props) {
  const [files, setFiles] = useState(props.files);

  const onFileChange = (file) => {
    setFiles(files.map(oldFile => {
      return oldFile.name === file.name ? file : oldFile;
    }));
  };

  return <EditorView filesPane={<FilesPane onChange={onFileChange} files={files} />} displayPane={<DisplayPane />} />;
}