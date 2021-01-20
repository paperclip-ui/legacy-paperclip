import React, { useMemo, useRef, useState } from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import * as styles from "./index.pc";
import * as path from "path";
import TextInput from "paperclip-visual-editor/src/components/TextInput/index.pc";
import { useTextInput } from "paperclip-visual-editor/src/components/TextInput";
import {
  fileItemClicked,
  newFileNameEntered,
  syncPanelsClicked,
} from "../../../../actions";
import { redirectRequest } from "paperclip-visual-editor/src/actions";

export const Toolbar = () => {
  const { state, dispatch } = useAppStore();
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState<string>();
  const [showFileMenu, setShowFileMenu] = useState(false);
  const onAddFile = (e) => {
    setShowNewFileInput(true);
  };

  const onFileItemClick = (uri) => {
    setShowFileMenu(false);
    dispatch(fileItemClicked({ uri }));
  };

  const onNewInputBlur = () => {
    setNewFileName(null);
    setShowNewFileInput(false);
  };

  const basename = path.basename(state.currentCodeFileUri);
  const keepMenuOpen = showFileMenu || showNewFileInput;
  const allFileUris = useMemo(
    () => Object.keys(state.designMode.documentContents),
    [state.designMode.documentContents]
  );
  const fileMenuButton = useRef<HTMLDivElement>();

  const { inputProps: newFileInputProps } = useTextInput({
    value: newFileName,
    onValueChange: setNewFileName,
  });

  const onNewFileNameKeyPress = (e) => {
    if (e.key !== "Enter") {
      return;
    }
    for (const uri of allFileUris) {
      if (
        uri.replace(/(\w+:\/\/\/|\.pc$)/g, "") ===
        newFileName.replace(".pc", "")
      ) {
        return alert(`A file with that name already exists`);
      }
    }
    dispatch(newFileNameEntered({ value: newFileName }));
    setShowNewFileInput(false);
    setNewFileName("");
  };
  const onBlur = () => {
    if (fileMenuButton.current.contains(document.activeElement)) {
      return;
    }

    setShowFileMenu(false);
  };

  const onSyncPanelsClick = () => {
    dispatch(syncPanelsClicked(null));
  };
  return (
    <styles.Topbar>
      <styles.FileMenuButton
        ref={fileMenuButton}
        active={keepMenuOpen}
        onClick={(e) => {
          setShowFileMenu(!keepMenuOpen);
        }}
        onFocus={() => {
          // setShowFileMenu(true);
        }}
        onBlur={onBlur}
        name={basename}
        menu={
          keepMenuOpen && (
            <styles.FileMenu>
              <styles.FileMenuItems>
                {allFileUris.map((uri) => {
                  return (
                    <styles.FileMenuItem
                      key={uri}
                      onClick={() => {
                        onFileItemClick(uri);
                      }}
                    >
                      {path.basename(uri)}
                    </styles.FileMenuItem>
                  );
                })}
                {showNewFileInput && (
                  <styles.FileMenuItem noFocus>
                    <TextInput
                      autoFocus
                      onBlur={onNewInputBlur}
                      {...newFileInputProps}
                      onKeyPress={onNewFileNameKeyPress}
                    />
                  </styles.FileMenuItem>
                )}
              </styles.FileMenuItems>

              <styles.AddFileMenuItem onClick={onAddFile} />
            </styles.FileMenu>
          )
        }
      />
      {state.currentCodeFileUri !==
        state.designMode.ui.query.currentFileUri && (
        <styles.EyeButton onClick={onSyncPanelsClick} />
      )}
    </styles.Topbar>
  );
};
