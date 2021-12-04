import React, { useState } from "react";
import * as styles from "./index.pc";

export type ChildProps = {
  depth: number;
};

export type NodeProps = {
  selected: boolean;
  label: any;
  isFile?: boolean;
  isDirectory?: boolean;
  depth: number;
  expanded: boolean;
  onExpandClick: () => void;
  children: (props: ChildProps) => any;
};

export const Node = ({
  depth,
  selected,
  label,
  isFile,
  isDirectory,
  expanded,
  children,
  onExpandClick,
}: NodeProps) => {
  let icon;

  if (isFile) {
    icon = <styles.FileIcon />;
  }

  if (isDirectory) {
    icon = <styles.FolderIcon />;
  }

  return (
    <styles.Node
      depth={depth}
      leaf={label}
      hasChildren={isDirectory}
      open={expanded}
      selected={selected}
      controls={null}
      icon={icon}
      onLeafClick={onExpandClick}
    >
      {expanded &&
        children({
          depth: depth + 1,
        })}
    </styles.Node>
  );
};
