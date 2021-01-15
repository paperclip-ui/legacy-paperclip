import React from "react";
import { TextEditor } from "./TextEditor";
import * as styles from "./index.pc";
import { Toolbar } from "./Toolbar";

export const CodeMode = () => {
  return (
    <styles.Container>
      <Toolbar />
      <TextEditor />
    </styles.Container>
  );
};
