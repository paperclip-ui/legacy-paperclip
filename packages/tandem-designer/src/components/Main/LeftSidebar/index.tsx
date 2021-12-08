import React from "react";
import { FilesPane } from "./files";
import { ResizableContainer } from "../../ResizableContainer";
import * as paneStyles from "../../Pane/index.pc";
import * as styles from "./index.pc";
import { Header } from "./Header";

export const LeftSidebar = () => {
  return (
    <>
      <ResizableContainer orientation="left" scrollable id="LeftSidebar">
        <styles.Container>
          <Header />
          <paneStyles.Container>
            <FilesPane />
          </paneStyles.Container>
        </styles.Container>
      </ResizableContainer>
    </>
  );
};
