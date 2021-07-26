import React, { useCallback } from "react";
import { VirtualElement } from "paperclip-utils";
import * as styles from "./index.pc";
import { nodePathToAry } from "paperclip-utils";
import { Children } from "./Children";

export type ElementProps = {
  path: string;
  selectedNodePath: string;
  value: VirtualElement;
  expandedPaths: string[];
  onExpandToggleClick: (path: string) => void;
  onLeafClick: (path: string, meta: boolean) => void;
};

export const Element = React.memo(
  ({
    selectedNodePath,
    path,
    value: element,
    expandedPaths,
    onExpandToggleClick,
    onLeafClick
  }: ElementProps) => {
    const attributes = [];

    const onLeafClick2 = useCallback(
      (event: React.MouseEvent<any>) => {
        onLeafClick(path, event.metaKey);
      },
      [path]
    );

    const onExpandToggleClick2 = useCallback(
      (event: React.MouseEvent<any>) => {
        event.stopPropagation();
        onExpandToggleClick(path);
      },
      [path]
    );

    for (const key in element.attributes) {
      let value = element.attributes[key];

      if (key === "class") {
        // filter out scopes
        value = value
          .split(" ")
          .filter(value => {
            if (/^_(pub-)?\w+(_|$)/.test(value)) {
              return false;
            }
            return true;
          })
          .join(" ");

        if (!value) {
          continue;
        }
      }

      attributes.push(<styles.Attribute name={key} value={value} />);
    }
    const isVoid = VOID_TAG_NAMES.includes(element.tagName);
    const expanded = expandedPaths.includes(path) && !isVoid;
    const depth = nodePathToAry(path).length;

    return (
      <styles.Element
        noChildren={element.children.length === 0}
        active={selectedNodePath === path}
        isVoid={isVoid}
        onLeafClick={onLeafClick2}
        onExpandToggleClick={onExpandToggleClick2}
        depth={depth}
        name={element.tagName}
        attributes={attributes.length ? attributes : null}
        collapsed={!expanded || element.children.length === 0}
      >
        {expanded && (
          <Children
            selectedNodePath={selectedNodePath}
            onLeafClick={onLeafClick}
            parent={element}
            parentPath={path}
            expandedPaths={expandedPaths}
            onExpandToggleClick={onExpandToggleClick}
          />
        )}
      </styles.Element>
    );
  }
);

const VOID_TAG_NAMES = [
  "area",
  "base",
  "basefont",
  "bgsound",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "image",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "menuitem",
  "meta",
  "nextid",
  "param",
  "source",
  "track",
  "wbr"
];
