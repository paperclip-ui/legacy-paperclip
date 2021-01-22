import React, { useState } from "react";
import { ControlledEditor } from "@monaco-editor/react";
import {
  globalZKeyDown,
  globalYKeyDown,
  globalSaveKeyPress
} from "paperclip-designer/src/actions";

// Can't import, otherwise the react monaco editor breaks :(
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

import * as styles from "./index.pc";
import { Toolbar } from "./Toolbar";
import { useAppStore } from "../../../hooks/useAppStore";
import { codeEditorChanged, slimCodeEditorChanged } from "../../../actions";
import { SlimEditor } from "./Slim";

export const CodeMode = () => {
  const { state, dispatch } = useAppStore();
  const { slim } = state;
  const code = String(
    state.shared.documents[state.currentCodeFileUri]
  ).toString();

  const onChange = event => {
    dispatch(codeEditorChanged(event.changes));
  };
  const editorDidMount = (_, editor) => {
    editor.getModel().updateOptions({ tabSize: 2 });

    // control Z
    editor.addCommand(2104, function() {
      // 🙈
      dispatch(globalZKeyDown(null) as any);
    });

    // Note that we cna't do this
    // monacoEditor.KeyMod.CtrlCmd | monacoEditor.KeyCode.KEY_Y
    editor.addCommand(2013, function() {
      dispatch(globalYKeyDown(null) as any);
    });
    // console.log(monacoEditor.KeyMod.CtrlCmd | monacoEditor.KeyCode.KEY_S);

    editor.addCommand(2097, function() {
      dispatch(globalSaveKeyPress(null) as any);
    });
  };
  return (
    <styles.Container>
      <Toolbar />
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
    </styles.Container>
  );
};
