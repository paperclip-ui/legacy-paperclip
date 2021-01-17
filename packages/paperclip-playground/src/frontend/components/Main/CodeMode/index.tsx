import React from "react";
import { ControlledEditor } from "@monaco-editor/react";
import * as styles from "./index.pc";
import { Toolbar } from "./Toolbar";
import { useAppStore } from "../../../hooks/useAppStore";
import { codeEditorChanged } from "../../../actions";

export const CodeMode = () => {
  const { state, dispatch } = useAppStore();
  const code = state.documentContents[state.ui.query.currentFileUri];

  const onChange = (ev, value) => {
    dispatch(codeEditorChanged(value));
  };
  const editorDidMount = (_, editor) => {
    editor.getModel().updateOptions({ tabSize: 2 });
  };
  return (
    <styles.Container>
      <Toolbar />
      <ControlledEditor
        editorDidMount={editorDidMount}
        options={{
          minimap: {
            enabled: false,
          },
        }}
        width="100%"
        height="100%"
        value={code}
        language="html"
        onChange={onChange}
        theme="vs-dark"
      />
    </styles.Container>
  );
};
