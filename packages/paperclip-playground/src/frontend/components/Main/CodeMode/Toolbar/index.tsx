import React, { memo, useMemo, useRef, useState } from "react";
import { useAppStore } from "../../../../hooks/useAppStore";
import * as styles from "./index.pc";
import * as path from "path";
import TextInput from "paperclip-designer/src/components/TextInput/index.pc";
import { useTextInput } from "paperclip-designer/src/components/TextInput";
import { useSelect } from "paperclip-designer/src/components/Select";

import {
  fileItemClicked,
  fileRenamed,
  newFileNameEntered,
  removeFileClicked,
  syncPanelsClicked
} from "../../../../actions";
import { redirectRequest } from "paperclip-designer/src/actions";
import { isPaperclipFile } from "paperclip-utils";

export const Toolbar = () => {
  const { state, dispatch } = useAppStore();
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState<string>();
  const onAddFile = e => {
    setShowNewFileInput(true);
  };
  const select = useSelect();

  const onFileItemClick = uri => {
    select.close();
    dispatch(fileItemClicked({ uri }));
  };

  const onRemoveClick = (uri) => {
    if (state.currentProject?.data?.mainFileUri == uri) {
      return alert(`You can't delete the main file`);
    }
    
    if (isPaperclipFile(uri) && Object.keys(state.shared.documents).filter(isPaperclipFile).length === 1) {
      return alert(`You must have at least one Paperclip file`);
    }
    select.close();
    dispatch(removeFileClicked({ uri }))
  }

  const onNewInputBlur = () => {
    setNewFileName(null);
    setShowNewFileInput(false);
  };

  const basename = path.basename(state.currentCodeFileUri);
  const allFileUris = useMemo(() => Object.keys(state.shared.documents), [
    state.shared.documents
  ]);

  const { inputProps: newFileInputProps } = useTextInput({
    value: newFileName,
    onValueChange: setNewFileName
  });

  const onNewFileNameKeyPress = e => {
    if (e.key !== "Enter") {
      return;
    }
    if (fileExists(newFileName, allFileUris)) {
      return alert(`A file with that name already exists`);
    }
    dispatch(newFileNameEntered({ value: newFileName }));
    setShowNewFileInput(false);
    setNewFileName("");
    select.close();
  };

  const onSyncPanelsClick = () => {
    dispatch(syncPanelsClicked(null));
  };
  const onRenamed = (uri: string, newName: string) => {


    // for now
    if (state.currentProject?.data?.mainFileUri == uri) {
      return alert(`You can't rename the main file`);
    }

    if (fileExists(uri, allFileUris)) {
      return alert(`A file with that name already exists`);
    }
    dispatch(fileRenamed({ newName, uri }));
    select.close();
  }
  return (
    <styles.Topbar>
      <styles.FileSelect
        ref={select.ref}
        active={select.menuVisible}
        onButtonClick={select.onButtonClick}
        onBlur={select.onBlur}
        name={basename}
        menu={
          select.menuVisible && (
            <styles.FileMenu>
              <styles.FileMenuItems>
                {allFileUris.map(uri => {
                  return (
                    <FileMenuItem onRenamed={onRenamed} uri={uri} onFileItemClick={onFileItemClick} onRemoveClick={onRemoveClick}  />
                  );
                })}
                {showNewFileInput && (
                  <styles.FileMenuItem noFocus moreSelect={null}>
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
      {state.currentCodeFileUri !== state.designer.ui.query.currentFileUri && (
        <styles.EyeButton onClick={onSyncPanelsClick} />
      )}
    </styles.Topbar>
  );
};
type FileMenuItemProps = {
  uri: string;
  onFileItemClick: (uri: string) => void;
  onRemoveClick: (uri: string) => void;
  onRenamed: (uri: string, newName: string) => void;
}

const FileMenuItem = memo(({ uri, onRenamed, onFileItemClick, onRemoveClick}: FileMenuItemProps) => {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState<string>(path.basename(uri));
  const renamingInputProps = useTextInput({
    value: newName,
    onValueChange: setNewName,
    select: true
  }).inputProps;

  const select = useSelect();
  const onRenameClick = () => {
    setRenaming(true);
    select.close();
  };
  const onNewNameBlur = () => {
    onRenamed(uri, newName);
    setRenaming(false);
  }
  const onNewNameKeyPress = (event) => {
    if (event.key === "Enter") {
      onRenamed(uri, newName);
      setRenaming(false);
    }
  }

  return <styles.FileMenuItem
  key={uri}
  onClick={() => {
    onFileItemClick(uri);
  }}
  moreSelect={<styles.MoreFileSelect onClick={select.onClick} onBlur={select.onBlur} menu={select.menuVisible && <styles.MoreFileMenu
    onRemoveClick={() => onRemoveClick(uri)}
    onRenameClick={onRenameClick}
  />}>
    <styles.MoreFileButton onClick={select.onButtonClick} />
  </styles.MoreFileSelect>}
>
  {renaming ? <TextInput
                      autoFocus
                      onBlur={onNewNameBlur}
                      {...renamingInputProps}
                      onKeyPress={onNewNameKeyPress}
                    /> : path.basename(uri)}
</styles.FileMenuItem>;
});


const fileExists = (uri: string, allFiles: any) => {
  for (const uri of allFiles) {
    if (
      uri.replace(/(\w+:\/\/\/|\.pc$)/g, "") ===
      uri.replace(".pc", "")
    ) {
      return true;
    }
  }
  return false;
}