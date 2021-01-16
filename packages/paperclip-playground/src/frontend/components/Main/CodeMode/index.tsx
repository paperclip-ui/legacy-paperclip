import React from "react";
import MonacoEditor from "@monaco-editor/react";
import * as styles from "./index.pc";
import { Toolbar } from "./Toolbar";
import { useAppStore } from "../../../hooks/useAppStore";

export const CodeMode = () => {
  const { state } = useAppStore();
  const code = state.documentContents[state.currentFileUri];
  return (
    <styles.Container>
      <Toolbar />
      <MonacoEditor width="100%" height="100%" value={code} language="html" />
    </styles.Container>
  );
};
