import {
  AvailableNode,
  AvailableNodeKind,
} from "@paperclip-ui/language-service";
import { TextInput } from "@tandem-ui/design-system";
import React, { memo, useState } from "react";
import { useSelector } from "react-redux";
import { getInsertableNodes, shouldShowQuickfind } from "../../../../state";
import * as styles from "./index.pc";

export const Quickfind = () => {
  const { visible, insertableNodes, onFilterChange } = useQuickfind();

  if (!visible) {
    return null;
  }

  return (
    <styles.Container
      filterInput={
        <TextInput
          autoFocus
          big
          secondary
          wide
          onValueChange={onFilterChange}
        />
      }
      items={
        <>
          {insertableNodes.map((node, i) => (
            <InsertableNode node={node} key={i} />
          ))}
        </>
      }
    />
  );
};

const useQuickfind = () => {
  const visible = useSelector(shouldShowQuickfind);
  const [filter, setFilter] = useState<string>();
  const insertableNodes = useSelector(getInsertableNodes);
  const onFilterChange = (value: string) => {
    setFilter(value && value.toLowerCase());
  };

  return {
    visible,
    insertableNodes: insertableNodes.filter((node) => {
      return (
        !filter ||
        node.name.toLowerCase().includes(filter) ||
        node.kind.toLowerCase().includes(filter)
      );
    }),
    onFilterChange,
  };
};

type InsertableNodeProps = {
  node: AvailableNode;
};

const InsertableNode = memo(({ node }: InsertableNodeProps) => {
  return (
    <styles.Item
      isText={node.kind === AvailableNodeKind.Text}
      isElement={node.kind === AvailableNodeKind.Element}
      isComponent={node.kind === AvailableNodeKind.Instance}
      title={node.name}
      description={node.description}
    />
  );
});
