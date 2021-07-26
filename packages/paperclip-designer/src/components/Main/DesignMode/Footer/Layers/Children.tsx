import React from "react";
import { VirtualElement, VirtualNodeKind } from "paperclip-utils";
import { Text } from "./Text";
import { Element } from "./Element";
import { nodePathToAry } from "paperclip-utils";

export type ChildrenProps = {
  parentPath: string;
  selectedNodePath: string;
  parent: VirtualElement;
  expandedPaths: string[];
  onExpandToggleClick: (path: string) => void;
  onLeafClick: (path: string, meta: boolean) => void;
};

export const Children = React.memo(
  ({
    selectedNodePath,
    parentPath,
    parent,
    expandedPaths,
    onLeafClick,
    onExpandToggleClick
  }: ChildrenProps) => {
    const parentPathAry = nodePathToAry(parentPath);

    return (
      <>
        {parent.children
          .map((child, i) => {
            const childPath = [...parentPathAry, i].join(".");

            if (child.kind === VirtualNodeKind.Text) {
              if (!child.value.trim()) {
                return null;
              }
              return (
                <Text
                  key={i}
                  selectedNodePath={selectedNodePath}
                  onLeafClick={onLeafClick}
                  path={childPath}
                  value={child}
                />
              );
            } else if (child.kind === VirtualNodeKind.Element) {
              return (
                <Element
                  key={i}
                  selectedNodePath={selectedNodePath}
                  path={childPath}
                  onLeafClick={onLeafClick}
                  value={child}
                  expandedPaths={expandedPaths}
                  onExpandToggleClick={onExpandToggleClick}
                />
              );
            }
          })
          .filter(Boolean)}
      </>
    );
  }
);
