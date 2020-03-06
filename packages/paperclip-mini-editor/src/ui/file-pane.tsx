import { useState, useEffect } from "react";
import * as React from "react";
import { FilesPane as FilesPaneView, Tab } from "./template.pc";
import { OpenFile } from "../state";
import {editor} from "monaco-editor";

type Props = {
  files: OpenFile[]
}

export function FilesPane(props: Props) {
  const [activeFileName, setActiveFileName] = useState(props.files[0].name);


  const setActiveFile = (file: OpenFile) => {
    setActiveFileName(file.name);
  };

  
  return <FilesPaneView editor="OK" tabs={props.files.map(file => {
    return <Tab key={file.name} active={activeFileName === file.name} onClick={() => setActiveFile(file)}>
      {file.name}
    </Tab>;
  })} />;
}