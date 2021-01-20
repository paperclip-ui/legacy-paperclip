import React, { useMemo, useRef, useState } from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import * as styles from "./index.pc";
import * as path from "path";
import TextInput from "paperclip-visual-editor/src/components/TextInput/index.pc";
import { useMenu } from "paperclip-visual-editor/src/components/Menu";
import { useTextInput } from "paperclip-visual-editor/src/components/TextInput";
import {
  fileItemClicked,
  newFileNameEntered,
  syncPanelsClicked
} from "../../../../actions";

export const Toolbar = () => {
  const { state, dispatch } = useAppStore();
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState<string>();
  const onAddFile = e => {
    setShowNewFileInput(true);
  };

  const menu = useMenu();

  const onFileItemClick = uri => {
    menu.close();
    dispatch(fileItemClicked({ uri }));
  };

  const onNewInputBlur = () => {
    setNewFileName(null);
    setShowNewFileInput(false);
  };

  const basename = path.basename(state.currentCodeFileUri);
  const allFileUris = useMemo(
    () => Object.keys(state.designMode.documentContents),
    [state.designMode.documentContents]
  );

  const { inputProps: newFileInputProps } = useTextInput({
    value: newFileName,
    onValueChange: setNewFileName
  });

  const onNewFileNameKeyPress = e => {
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
    menu.close();
    setShowNewFileInput(false);
    setNewFileName("");
  };

  const onSyncPanelsClick = () => {
    dispatch(syncPanelsClicked(null));
  };
  return (
    <styles.Topbar>
      <styles.FileSelect
        ref={menu.ref}
        active={menu.showOptions}
        onButtonClick={menu.onButtonClick}
        onBlur={menu.onButtonBlur}
        name={basename}
        menu={
          menu.showOptions && (
            <styles.FileMenu>
              <styles.FileMenuItems>
                {allFileUris.map(uri => {
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
