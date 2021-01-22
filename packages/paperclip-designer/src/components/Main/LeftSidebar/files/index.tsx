import React from "react";
import * as paneStyles from "../../Pane/index.pc";
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
        kind
      })
    );
  };

  return (
    <paneStyles.Container>
      <paneStyles.Header>Files</paneStyles.Header>
      {state.designer.projectDirectory &&
        state.designer.projectDirectory.children.map(child => {
          return (
            <FSNode
              onLeafClick={onLeafClick}
              item={child}
              key={child.absolutePath}
              depth={0}
            />
          );
        })}
    </paneStyles.Container>
  );
};

type FSItemNodeProps = {
  item?: FSItem;
  depth: number;
  onLeafClick: (item: FSItem) => void;
};

const FSNode = ({ item, depth, onLeafClick }: FSItemNodeProps) => {
  if (!item) {
    return null;
  }
  return (
    <Node
      isFile={item.kind === FSItemKind.FILE}
      label={item.name}
      depth={depth}
      onExpand={() => {
        onLeafClick(item);
      }}
      selected={false}
    >
      {({ depth }) => {
        if (item.kind === FSItemKind.DIRECTORY) {
          return item.children.map(child => (
            <FSNode onLeafClick={onLeafClick} item={child} depth={depth} />
          ));
        }
        return null;
      }}
    </Node>
  );
};
