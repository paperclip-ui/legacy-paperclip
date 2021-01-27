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
  filesDropped,
  newFileNameEntered,
  removeFileClicked,
  syncPanelsClicked
} from "../../../../actions";
import { redirectRequest } from "paperclip-designer/src/actions";
import { isPaperclipFile } from "paperclip-utils";
import { canUpload, getNewFilePath } from "../../../../state";

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

  const onRemoveClick = uri => {
    if (state.currentProject?.data?.mainFilePath == uri) {
      return alert(`You can't delete the main file`);
    }

    if (
      isPaperclipFile(uri) &&
      Object.keys(state.shared.documents).filter(isPaperclipFile).length === 1
    ) {
      return alert(`You must have at least one Paperclip file`);
    }
    select.close();
    dispatch(removeFileClicked({ uri }));
  };

  const onNewInputBlur = () => {
    setNewFileName(null);
    setShowNewFileInput(false);
  };

  const relativePath = stripRoot(state.currentCodeFilePath);
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
    const uri = getNewFilePath(newFileName, null);

    if (fileExists(uri, allFileUris)) {
      return alert(`A file with that name already exists`);
    }
    dispatch(newFileNameEntered({ uri }));
    setShowNewFileInput(false);
    setNewFileName("");
    select.close();
  };

  const onSyncPanelsClick = () => {
    dispatch(syncPanelsClicked(null));
  };
  const onRenamed = (uri: string, newName: string) => {
    // for now
    if (state.currentProject?.data?.mainFilePath == uri) {
      return alert(`You can't rename the main file`);
    }
    const newUri = getNewFilePath(newName, uri);

    if (fileExists(newUri, allFileUris)) {
      return alert(`A file with that name already exists`);
    }
    dispatch(fileRenamed({ newUri, uri }));
    select.close();
  };
  const onUploadChange = (event: React.ChangeEvent<any>) => {
    const input = event.target as HTMLInputElement;
    if (!canUpload(input.files)) {
      `Whoops, can't upload that. Make sure you're only uploading images that are under 2 MB`;
    }
    dispatch(filesDropped(input.files));
    select.close();
  };
  return (
    <styles.Topbar>
      <styles.FileSelect
        ref={select.ref}
        active={select.menuVisible}
        onButtonClick={select.onButtonClick}
        onBlur={select.onBlur}
        name={relativePath}
        menu={
          select.menuVisible && (
            <styles.FileMenu>
              <styles.FileMenuItems>
                {allFileUris.map(uri => {
                  return (
                    <FileMenuItem
                      key={uri}
                      onRenamed={onRenamed}
                      uri={uri}
                      onFileItemClick={onFileItemClick}
                      onRemoveClick={onRemoveClick}
                    />
                  );
                })}
                {showNewFileInput && (
                  <styles.FileMenuItem noFocus moreSelect={null}>
                    <TextInput
                      type="text"
                      autoFocus
                      onBlur={onNewInputBlur}
                      {...newFileInputProps}
                      onKeyPress={onNewFileNameKeyPress}
                    />
                  </styles.FileMenuItem>
                )}
              </styles.FileMenuItems>

              <styles.MenuFooter>
                <styles.AddDocumentButton page onClick={onAddFile}>
                  Create new page
                </styles.AddDocumentButton>
                <styles.AddDocumentButton
                  media
                  onChange={onUploadChange}
                  accept=".pc, .jpeg, .jpg, .svg, .png"
                >
                  Upload file
                </styles.AddDocumentButton>
              </styles.MenuFooter>
            </styles.FileMenu>
          )
        }
      />
      {state.currentCodeFilePath !== state.designer.ui.query.canvasFile && (
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
};

const FileMenuItem = memo(
  ({ uri, onRenamed, onFileItemClick, onRemoveClick }: FileMenuItemProps) => {
    const [renaming, setRenaming] = useState(false);
    const [newName, setNewName] = useState<string>(uri);
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
    };
    const onNewNameKeyPress = event => {
      if (event.key === "Enter") {
        onRenamed(uri, newName);
        setRenaming(false);
      }
    };

    return (
      <styles.FileMenuItem
        key={uri}
        onClick={() => {
          onFileItemClick(uri);
        }}
        moreSelect={
          <styles.MoreFileSelect
            onClick={select.onClick}
            onBlur={select.onBlur}
            menu={
              select.menuVisible && (
                <styles.MoreFileMenu
                  onRemoveClick={() => onRemoveClick(uri)}
                  onRenameClick={onRenameClick}
                />
              )
            }
          >
            <styles.MoreFileButton onClick={select.onButtonClick} />
          </styles.MoreFileSelect>
        }
      >
        {renaming ? (
          <TextInput
            autoFocus
            type="text"
            onBlur={onNewNameBlur}
            {...renamingInputProps}
            onKeyPress={onNewNameKeyPress}
          />
        ) : (
          stripRoot(uri)
        )}
      </styles.FileMenuItem>
    );
  }
);

const stripRoot = uri => uri.replace(/^\w+:\/\/\//, "");

const fileExists = (testUri: string, allFiles: any) => {
  for (const uri of allFiles) {
    if (testUri === uri) {
      return true;
    }
  }
  return false;
};
