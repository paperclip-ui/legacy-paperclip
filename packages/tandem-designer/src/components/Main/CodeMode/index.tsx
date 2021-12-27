import React, { useEffect, useRef, useState } from "react";
import {
  globalZKeyDown,
  globalYKeyDown,
  globalSaveKeyPress,
  codeChanged
} from "../../../actions";
import loadMonaco from "@monaco-editor/loader";

// Can't import, otherwise the react monaco editor breaks :(
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

export type Monaco = typeof monacoEditor;
// TODO: https://github.com/microsoft/monaco-editor/issues/221

import * as styles from "./index.pc";
// import { Toolbar } from "./Toolbar";
import { useAppStore } from "../../../hooks/useAppStore";
// import { slimCodeEditorChanged } from "../../../actions";
// import { canEditFile } from "../../../state";
import { active as activatePaperclipExtension } from "paperclip-monaco";
import { StringRange } from "paperclip-utils";
import { isMediaFile, isPlainTextFile } from "tandem-common/lib/mime";

export const CodeMode = () => {
  const { state, dispatch } = useAppStore();
  const currentCodeFilePath = state.designer.ui.query.canvasFile;
  const highlightLocation = null;

  let content;

  const onChange = code => {
    dispatch(codeChanged({ value: code }));
  };
  const onMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
      dispatch(globalSaveKeyPress(null) as any);
    });
  };

  // code & uri need to be set at the exact same time so that editor instance
  const [[code, uri], setCode] = useState<[string, string]>([null, null]);
  const docContent = state.shared.documents[currentCodeFilePath];

  useEffect(() => {
    const uri = currentCodeFilePath;

    if (docContent instanceof File) {
      const reader = new FileReader();
      reader.onload = () => setCode([String(reader.result), uri]);
      reader.readAsText(docContent);
    } else {
      setCode([String(docContent || ""), uri]);
    }
  }, [docContent, currentCodeFilePath]);

  if (isPlainTextFile(currentCodeFilePath)) {
    content = (
      <styles.Content>
        <Editor
          uri={uri}
          value={code}
          highlightLocation={highlightLocation}
          onChange={onChange}
          onMount={onMount}
        />
      </styles.Content>
    );
  } else {
    content = <styles.CantEditScreen />;
  }
  return (
    <styles.Container>
      {/* <Toolbar /> */}
      {content}
    </styles.Container>
  );
};

export type EditorProps = {
  uri: string;
  value: string;
  highlightLocation: StringRange;
  onChange: (value: string) => void;
  onMount: (editor: any, monaco: any) => void;
};

const Editor = ({
  uri,
  value,
  onChange,
  highlightLocation,
  onMount
}: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>();
  const [monaco, setMonaco] = useState<Monaco>();
  const [editor, setEditor] = useState<monacoEditor.editor.ICodeEditor>();
  const [models, setModels] = useState<
    Record<string, monacoEditor.editor.ITextModel>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!editor) {
      return;
    }
    if (editor.getModel().uri.toString() !== uri) {
      const model =
        monaco.editor.getModel(monaco.Uri.parse(uri)) ||
        monaco.editor.createModel(value, undefined, monaco.Uri.parse(uri));
      editor.setModel(model);
      editor.saveViewState();
    } else if (editor.getValue() !== value) {
      editor.executeEdits("", [
        {
          range: editor.getModel().getFullModelRange(),
          text: value
        }
      ]);

      editor.pushUndoStop();
    }
  }, [monaco, editor, uri, value]);

  useEffect(() => {
    if (!highlightLocation) {
      return;
    }

    // dirty tricks here - trying to race against page changes. I'm
    // just too damn lazy to do it the right way.
    setTimeout(() => {
      const range = getRange(
        editor.getModel(),
        highlightLocation.start.pos,
        highlightLocation.end.pos
      );
      editor.setSelection(range);

      editor.revealLine(range.startLineNumber);
    }, 100);
  }, [highlightLocation]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    // need async import so that designer can run in node
    loadMonaco.init().then(monaco => {
      setMonaco(monaco);

      // might exist if switching between pages - models are global so we need to dispose.
      const model = monaco.editor.getModel(monaco.Uri.parse(uri));
      if (model) {
        model.dispose();
      }

      activatePaperclipExtension(monaco as any, { getCurrentUri: null });

      const editor = monaco.editor.create(editorRef.current, {
        language: "paperclip",
        tabSize: 2,
        automaticLayout: true,
        insertSpaces: true,
        model: monaco.editor.createModel(
          value || "",
          undefined,
          monaco.Uri.parse(uri)
        )
      });

      monaco.editor.setTheme("vs-dark");
      setEditor(editor);

      editor.onDidChangeModelContent(() => {
        onChange(editor.getValue());
      });

      onMount(editor, monaco);

      setLoading(false);
    });
    return () => {};
  }, []);

  return (
    <>
      <div ref={editorRef} style={{ height: `100%`, width: "100%" }} />
    </>
  );
};

const getRange = (
  model: monacoEditor.editor.ITextModel,
  start: number,
  end: number
): monacoEditor.IRange => {
  const sp = model.getPositionAt(start);
  const ep = model.getPositionAt(end);

  return {
    startColumn: sp.column,
    startLineNumber: sp.lineNumber,
    endColumn: ep.column,
    endLineNumber: ep.lineNumber
  };
};
