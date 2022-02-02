import {
  AvailableBaseNode,
  AvailableInstance,
  AvailableNode,
  AvailableNodeKind,
} from "@paperclip-ui/language-service";
import { TextInput } from "@tandem-ui/design-system";
import React, { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AppState,
  getInsertableNodes,
  shouldShowQuickfind,
} from "../../../../state";
import * as styles from "./index.pc";
import * as path from "path";
import { stripFileProtocol } from "@paperclip-ui/utils";
import { uiActions } from "../../../../actions/ui-actions";
import { useDrag } from "react-dnd";

export const Quickfind = () => {
  const {
    visible,
    insertableNodes,
    projectDir,
    onDragItemStart,
    onFilterChange,
    onClickItem,
  } = useQuickfind();

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
            <InsertableNode
              node={node}
              key={i}
              projectDir={projectDir}
              onDragStart={onDragItemStart}
              onClick={onClickItem}
            />
          ))}
        </>
      }
    />
  );
};

const useQuickfind = () => {
  const visible = useSelector(shouldShowQuickfind);
  const dispatch = useDispatch();
  const [filter, setFilter] = useState<string>();
  const insertableNodes = useSelector(getInsertableNodes);
  const onDragItemStart = (node: AvailableNode) => {
    dispatch(uiActions.quickfindItemStartDrag(node));
  };
  const onClickItem = (node: AvailableNode) => {
    dispatch(uiActions.quickfindItemClick(node));
  };
  const onFilterChange = (value: string) => {
    setFilter(value && value.toLowerCase());
  };
  const projectDir = useSelector(
    (state: AppState) => state.designer.projectDirectory?.url
  );

  return {
    visible,
    projectDir,
    onDragItemStart,
    onClickItem,
    insertableNodes: insertableNodes.filter((node) => {
      return (
        !filter ||
        node.name.toLowerCase().includes(filter) ||
        node.kind.toLowerCase().includes(filter) ||
        ((node as AvailableInstance).sourceUri || "")
          .toLowerCase()
          .includes(filter)
      );
    }),
    onFilterChange,
  };
};

type InsertableNodeProps = {
  node: AvailableNode;
  projectDir: string;
  onDragStart: (node: AvailableNode) => void;
  onClick: (node: AvailableNode) => void;
};

const InsertableNode = memo(
  ({ node, projectDir, onDragStart, onClick }: InsertableNodeProps) => {
    // const [{isDragging}, drag, dragPreview] = useDrag(() => ({
    //   type: "insertableNode",
    //   item: node,
    //   collect: (monitor) => ({
    //     isDragging: monitor.isDragging()
    //   })
    // }));

    return (
      <styles.Item
        onDragStart={() => onDragStart(node)}
        onClick={() => onClick(node)}
        isText={node.kind === AvailableNodeKind.Text}
        isElement={node.kind === AvailableNodeKind.Element}
        isComponent={node.kind === AvailableNodeKind.Instance}
        title={node.name}
        description={node.description || getSourceDesc(node, projectDir)}
      />
    );
  }
);

export const getSourceDesc = (node: AvailableNode, projectDir: string) => {
  if (node.kind == AvailableNodeKind.Instance) {
    return projectDir
      ? path.relative(
          stripFileProtocol(projectDir),
          stripFileProtocol(node.sourceUri)
        )
      : stripFileProtocol(node.sourceUri);
  }
};
