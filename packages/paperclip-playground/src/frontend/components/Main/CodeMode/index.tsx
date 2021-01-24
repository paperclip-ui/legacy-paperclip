import React, { useEffect, useState } from "react";
import { ControlledEditor } from "@monaco-editor/react";
import {
  globalZKeyDown,
  globalYKeyDown,
  globalSaveKeyPress
} from "paperclip-designer/src/actions";

// Can't import, otherwise the react monaco editor breaks :(
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
// TODO: https://github.com/microsoft/monaco-editor/issues/221

import * as styles from "./index.pc";
import { Toolbar } from "./Toolbar";
import { useAppStore } from "../../../hooks/useAppStore";
import { codeEditorChanged, slimCodeEditorChanged } from "../../../actions";
import { SlimEditor } from "./Slim";
import { canEditFile } from "../../../state";

export const CodeMode = () => {
  const { state, dispatch } = useAppStore();
  const { slim } = state;

  let content;

  const onChange = (event, code) => {
    dispatch(slimCodeEditorChanged(code));
  };
  const editorDidMount = (_, editor) => {
    // control Z
    editor.addCommand(2104, function() {
      // 🙈
      dispatch(globalZKeyDown(null) as any);
    });

    // Note that we cna't do this
    // console.log(monacoEditor.KeyMod.CtrlCmd | monacoEditor.KeyMod.Shift | monacoEditor.KeyCode.KEY_Z);
    editor.addCommand(3128, function() {
      dispatch(globalYKeyDown(null) as any);
    });
    editor.addCommand(2013, function() {
      dispatch(globalYKeyDown(null) as any);
    });
    // console.log(monacoEditor.KeyMod.CtrlCmd | monacoEditor.KeyCode.KEY_S);

    editor.addCommand(2097, function() {
      dispatch(globalSaveKeyPress(null) as any);
    });
  };

  const [code, setCode] = useState<string>();
  const docContent = state.shared.documents[state.currentCodeFileUri];

  useEffect(() => {
    if (docContent instanceof File) {
      const reader = new FileReader();
      reader.onload = () => setCode(String(reader.result));
      reader.readAsText(docContent);
    } else {
      setCode(String(docContent));
    }
  }, [docContent]);

  if (canEditFile(state.currentCodeFileUri)) {
    content = (
      <styles.Content slim={slim}>
        {slim ? (
          <SlimEditor
            value={code}
            onChange={value => {
              dispatch(slimCodeEditorChanged(value));
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
    );
  } else {
    content = <styles.CantEditScreen />;
  }
  return (
    <styles.Container>
      <Toolbar />
      {content}
    </styles.Container>
  );
};
