import React from "react";
import { FilesPane } from "./files";
import * as styles from "./index.pc";

export const LeftSidebar = () => {
  return (
    <>
      <styles.Container>
        <FilesPane />
      </styles.Container>
    </>
  );
};
