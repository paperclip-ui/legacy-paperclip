import React, { useState } from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import * as styles from "./index.pc";

export const Toolbar = () => {
  const { state } = useAppStore();
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const onAddFileButtonClick = () => {
    setShowNewFileInput(true);
  };
  return (
    <styles.Topbar>
      {showNewFileInput && (
        <styles.Tab onRemoveButtonClick={null}>
          <input type="text" />
        </styles.Tab>
      )}
      <styles.AddFileButton onClick={onAddFileButtonClick} />
    </styles.Topbar>
  );
};
