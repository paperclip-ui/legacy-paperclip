import React from "react";
import { ControlledEditor } from "@monaco-editor/react";
import * as styles from "./index.pc";
import { Toolbar } from "./Toolbar";
import { useAppStore } from "../../../hooks/useAppStore";
import { codeEditorChanged } from "../../../actions";
import { SlimEditor } from "./Slim";

export const CodeMode = () => {
  const { state, dispatch } = useAppStore();
  const { slim } = state;
  const code = state.shared.documents[state.currentCodeFileUri];

  const onChange = (ev, value) => {
    dispatch(codeEditorChanged(value));
  };
  const editorDidMount = (_, editor) => {
    editor.getModel().updateOptions({ tabSize: 2 });
  };
  return (
    <styles.Container>
      <Toolbar />
      <styles.Content slim={slim}>
        {slim ? (
          <SlimEditor
            value={code}
            onChange={value => {
              dispatch(codeEditorChanged(value));
            }}
          />
        ) : (
          <ControlledEditor
            editorDidMount={editorDidMount}
            options={{
              minimap: {
                enabled: false
              }
            }}
            width="100%"
            value={code}
            language="html"
            onChange={onChange}
            theme="vs-dark"
          />
        )}
      </styles.Content>
    </styles.Container>
  );
};
