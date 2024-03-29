import React, { useEffect, useState } from "react";
import { codeChanged } from "../../../actions";

import * as styles from "./index.pc";
import { MonacoEditor } from "./MonacoEditor";
import { useAppStore } from "../../../hooks/useAppStore";
import { isPlainTextFile } from "@tandem-ui/common/lib/mime";
import { SlimEditor } from "./SlimEditor";
import { Toolbar } from "./Toolbar";

export const CodeMode = () => {
  const { state, dispatch } = useAppStore();
  const currentCodeFilePath = state.designer.currentCodeFile;
  const { useLiteEditor } = state.designer;
  const highlightLocation = null;

  let content;
  // code & uri need to be set at the exact same time so that editor instance
  const [[code, uri], setCode] = useState<[string, string]>(["", ""]);
  const docContent = state.shared.documents[currentCodeFilePath] || "";
  const onChange = code => {
    // will happen with REPL
    if (code === docContent) {
      return;
    }
    dispatch(codeChanged({ value: code }));
  };

  useEffect(() => {
    const uri = currentCodeFilePath;

    if (docContent instanceof File) {
      const reader = new FileReader();
      reader.onload = () => setCode([String(reader.result), uri]);
      reader.readAsText(docContent);
    } else {
      setCode([String(docContent), uri]);
    }
  }, [docContent, currentCodeFilePath]);

  if (isPlainTextFile(currentCodeFilePath)) {
    if (useLiteEditor) {
      content = (
        <styles.Content>
          <SlimEditor value={code} onChange={onChange} />
        </styles.Content>
      );
    } else {
      content = (
        <styles.Content>
          <MonacoEditor
            uri={uri}
            value={code}
            highlightLocation={highlightLocation}
            onChange={onChange}
          />
        </styles.Content>
      );
    }
  } else if (currentCodeFilePath) {
    content = <styles.CantEditScreen />;
  }
  return (
    <styles.Container>
      {state.designer.showCodeToolbar && <Toolbar />}
      {content}
    </styles.Container>
  );
};
