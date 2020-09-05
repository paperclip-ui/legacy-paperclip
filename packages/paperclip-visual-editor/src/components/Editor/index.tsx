import React from "react";
import { withAppStore } from "../../hocs";
import { Center } from "./Center";
import { LeftSidebar } from "./LeftSidebar";
import * as styles from "./index.pc";
import { EMBEDDED } from "../../constants";

export const Editor = withAppStore(() => {
  return (
    <styles.Container>
      {EMBEDDED ? null : <LeftSidebar />}
      <Center />
    </styles.Container>
  );
});
