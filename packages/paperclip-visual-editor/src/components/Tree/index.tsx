import React, { useState } from "react";
import * as styles from "./index.pc";

export type ChildProps = {
  depth: number;
};

export type NodeProps = {
  selected: boolean;
  label: any;
  depth: number;
  onExpand?: () => void;
  children: (props: ChildProps) => any;
};

export const Node = ({
  depth,
  selected,
  label,
  children,
  onExpand
}: NodeProps) => {
  const [expanded, setExpanded] = useState(false);

  const onLeafClick = () => {
    setExpanded(!expanded);
    if (onExpand) {
      onExpand();
    }
  };

  return (
    <styles.Node
      depth={depth}
      leaf={label}
      open={expanded}
      selected={selected}
      onLeafClick={onLeafClick}
    >
      {expanded &&
        children({
          depth: depth + 1
        })}
    </styles.Node>
  );
};
