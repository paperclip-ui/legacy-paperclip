import { useState, useEffect } from "react";
import * as ReactDOM from "react-dom";
import * as React from "react";
import { FilesPane as FilesPaneView, Tab, styled } from "./template.pc";
import { OpenFile } from "../state";
import {editor} from "monaco-editor";


const Mount = styled("div", { className: "mount" });

type Props = {
  files: OpenFile[],
  onChange(file: OpenFile);
}

type EditorProps = {
  value: string,
  onChange(content: string);
}

class Editor extends React.PureComponent<EditorProps> {
  private _instance: editor.IStandaloneCodeEditor;
  private _value: string;
  componentDidUpdate(props: EditorProps) {
    if (this._value !== props.value) {
      this._instance.getModel().setValue(props.value);
    }
  }

  componentDidMount() {
    const mount = ReactDOM.findDOMNode(this) as HTMLElement;
    const instance = this._instance = editor.create(mount, {
      value: this.props.value
    });
    const model = instance.getModel();
    model.onDidChangeContent(() => {
      this.props.onChange(this._value = model.getValue());
    });
  }
  render() {
    return <Mount />;
  }
}

export function FilesPane(props: Props) {
  const [activeFileName, setActiveFileName] = useState(props.files[0].name);
  const activeFile = props.files.find(({name}) => name === activeFileName);

  const setActiveFile = (file: OpenFile) => {
    setActiveFileName(file.name);
  };

  const onChange = (content: string) => {
    props.onChange({...activeFile, content });
  }

  return <FilesPaneView editor={<Editor onChange={onChange} value={activeFile.content} />} tabs={props.files.map(file => {
    return <Tab key={file.name} active={activeFileName === file.name} onClick={() => setActiveFile(file)}>
      {file.name}
    </Tab>;
  })} />;
}