import React from "react";
import { withAppStore } from "../../hocs";
import { Center } from "./Center";
import * as styles from "./index.pc";

export const Editor = withAppStore(() => {
  return (
    <styles.Container>
      <Center />
    </styles.Container>
  );
});
