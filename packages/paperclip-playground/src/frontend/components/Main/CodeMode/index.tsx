import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  globalZKeyDown,
  globalYKeyDown,
  globalSaveKeyPress
} from "paperclip-designer/src/actions";

// Can't import, otherwise the react monaco editor breaks :(
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

export type Monaco = typeof monacoEditor;
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

  const onChange = code => {
    dispatch(slimCodeEditorChanged(code));
  };
  const onMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    monaco.languages.css.cssDefaults.setModeConfiguration({
      completionItems: true,
      hovers: true,
      colors: true,
      documentSymbols: true
    });

    monaco.languages.html.htmlDefaults.setOptions({
      format: {
        ...monaco.languages.html.htmlDefaults.options.format,
        indentInnerHtml: false,
        tabSize: 4,
        insertSpaces: true,
        indentHandlebars: false,
        endWithNewline: false,
        wrapLineLength: 0
      }
    });

    editor.getModel().updateOptions({
      tabSize: 2,
      insertSpaces: true
    });

    // console.log(editor.);
    // control Z
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_Z, function() {
      // 🙈
      dispatch(globalZKeyDown(null) as any);
    });

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_Z,
      function() {
        dispatch(globalYKeyDown(null) as any);
      }
    );

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
      dispatch(globalSaveKeyPress(null) as any);
    });
  };

  const [code, setCode] = useState<string>();
  const docContent = state.shared.documents[state.currentCodeFilePath];

  useEffect(() => {
    if (docContent instanceof File) {
      const reader = new FileReader();
      reader.onload = () => setCode(String(reader.result));
      reader.readAsText(docContent);
    } else {
      setCode(String(docContent || ""));
    }
  }, [docContent]);

  if (canEditFile(state.currentCodeFilePath)) {
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
          <Editor
            onMount={onMount}
            options={{
              minimap: {
                enabled: false
              },
              autoIndent: "keep"
            }}
            onChange={onChange}
            width="100%"
            value={code}
            language="html"
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
