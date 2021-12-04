import React from "react";
import * as paneStyles from "../../../Pane/index.pc";
import { Node } from "../../../Tree";
import { useAppStore } from "../../../../hooks/useAppStore";
import { FSItem, FSItemKind } from "../../../../state";
import { fsItemClicked } from "../../../../actions";

export const FilesPane = () => {
  const { state, dispatch } = useAppStore();
  const onLeafClick = ({ absolutePath, url, kind }: FSItem) => {
    dispatch(
      fsItemClicked({
        absolutePath,
        url,
        kind,
      })
    );
  };

  return (
    <paneStyles.default flex scrollable title="Files">
      {state.designer.projectDirectory &&
        state.designer.projectDirectory.children.map((child) => {
          return (
            <FSNode
              onLeafClick={onLeafClick}
              item={child}
              selectedFileUri={state.designer.ui.query.canvasFile}
              expandedFilePaths={state.designer.expandedFilePaths}
              key={child.absolutePath}
              depth={0}
            />
          );
        })}
    </paneStyles.default>
  );
};

type FSItemNodeProps = {
  expandedFilePaths: string[];
  selectedFileUri?: string;
  item?: FSItem;
  depth: number;
  onLeafClick: (item: FSItem) => void;
};

const FSNode = ({
  item,
  depth,
  selectedFileUri,
  expandedFilePaths,
  onLeafClick,
}: FSItemNodeProps) => {
  if (!item) {
    return null;
  }

  const expanded = expandedFilePaths.includes(item.absolutePath);

  return (
    <Node
      isFile={item.kind === FSItemKind.FILE}
      isDirectory={item.kind === FSItemKind.DIRECTORY}
      label={item.name}
      depth={depth}
      expanded={expanded}
      onExpandClick={() => {
        onLeafClick(item);
      }}
      selected={selectedFileUri === item.url}
    >
      {({ depth }) => {
        if (item.kind === FSItemKind.DIRECTORY) {
          return item.children.map((child) => (
            <FSNode
              onLeafClick={onLeafClick}
              selectedFileUri={selectedFileUri}
              item={child}
              depth={depth}
              expandedFilePaths={expandedFilePaths}
            />
          ));
        }
        return null;
      }}
    </Node>
  );
};
