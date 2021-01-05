import React, { useState } from "react";
import { withAppStore } from "../../hocs";
import { Center } from "./Center";
import { LeftSidebar } from "./LeftSidebar";
import * as styles from "./index.pc";
import { useAppStore } from "../../hooks/useAppStore";

export const Editor = withAppStore(() => {
  const { state } = useAppStore();
  return (
    <styles.Container>
      {state.showLeftGutter ? <LeftSidebar /> : null}
      <Center />
    </styles.Container>
  );
});
