import loadMonaco from "@monaco-editor/loader";
import React, { useRef, useState, useEffect } from "react";
import { active as activatePaperclipExtension } from "@paperclip-ui/monaco";
import { StringRange } from "@paperclip-ui/utils";

import {
  globalZKeyDown,
  globalYKeyDown,
  globalSaveKeyPress,
  codeChanged
} from "../../../../actions";

// Can't import, otherwise the react monaco editor breaks :(
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useDispatch } from "react-redux";

export type Monaco = typeof monacoEditor;
// TODO: https://github.com/microsoft/monaco-editor/issues/221

export type EditorProps = {
  uri: string;
  value: string;
  highlightLocation: StringRange;
  onChange: (value: string) => void;
};

export const MonacoEditor = ({
  uri,
  value,
  onChange,
  highlightLocation
}: EditorProps) => {
  const dispatch = useDispatch();

  const editorRef = useRef<HTMLDivElement>();
  const [monaco, setMonaco] = useState<Monaco>();
  const [editor, setEditor] = useState<monacoEditor.editor.ICodeEditor>();
  const [models, setModels] = useState<
    Record<string, monacoEditor.editor.ITextModel>
  >({});
  const [loading, setLoading] = useState(true);

  const onMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
      dispatch(globalSaveKeyPress(null) as any);
    });
  };

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
