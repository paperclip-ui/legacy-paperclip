import React from "react";
import { Text } from "./Text";
import { Element } from "./Element";
import { VirtualNodeKind, VirtualNode } from "paperclip-utils";

export type NodeProps = {
  value: VirtualNode;
  selectedNodePath: string;
  path: string;
  expandedPaths: string[];
  onExpandToggleClick: (path: string) => void;
  onLeafClick: (path: string, meta: boolean) => void;
};

export const Node = ({
  value,
  path,
  onLeafClick,
  onExpandToggleClick,
  expandedPaths,
  selectedNodePath
}: NodeProps) => {
  if (value.kind === VirtualNodeKind.Text) {
    if (!value.value.trim()) {
      return null;
    }
    return (
      <Text
        selectedNodePath={selectedNodePath}
        onLeafClick={onLeafClick}
        path={path}
        value={value}
      />
    );
  } else if (value.kind === VirtualNodeKind.Element) {
    return (
      <Element
        selectedNodePath={selectedNodePath}
        path={path}
        onLeafClick={onLeafClick}
        value={value}
        expandedPaths={expandedPaths}
        onExpandToggleClick={onExpandToggleClick}
      />
    );
  }
};
