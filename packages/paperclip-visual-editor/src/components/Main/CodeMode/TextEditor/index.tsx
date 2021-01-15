import React from "react";
import Editor from "@monaco-editor/react";
import { useAppStore } from "../../../../hooks/useAppStore";

export const TextEditor = () => {
  const { state } = useAppStore();
  const code = state.documentContent[state.currentFileUri] || "";
  console.log(code);
  return <Editor width="100%" height="100%" language="html" value={code} />;
};
