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
import { InfiniteScroller } from "../../../InfiniteScroller";
import { useDrag } from "react-dnd";
import { intersection } from "lodash";

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
        <InfiniteScroller
          size={insertableNodes.length}
          itemHeight={40 + 8}
          haveMinHeight={false}
          minVerticalItems={8}
        >
          {(cursor, maxRows) => {
            return insertableNodes
              .slice(cursor, cursor + maxRows)
              .map((node, i) => (
                <InsertableNode node={node} key={i} projectDir={projectDir} />
              ));
          }}
        </InfiniteScroller>
      }
    />
  );
};

const useQuickfind = () => {
  const visible = useSelector(shouldShowQuickfind);
  const dispatch = useDispatch();
  const [filter, setFilter] = useState<string[]>();
  const insertableNodes = useSelector(getInsertableNodes);
  const onDragItemStart = (node: AvailableNode) => {
    dispatch(uiActions.quickfindItemStartDrag(node));
  };
  const onClickItem = (node: AvailableNode) => {
    dispatch(uiActions.quickfindItemClick(node));
  };
  const onFilterChange = (value: string) => {
    setFilter(value && value.replace(/\s+/, " ").trim().split(" "));
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
      if (!filter) {
        return true;
      }
      const tries = [
        node.name.toLowerCase(),
        node.kind.toLowerCase(),
        ((node as AvailableInstance).sourceUri || "").toLowerCase(),
      ]
        .join("")
        .trim();

      for (const part of filter) {
        if (!tries.includes(part)) {
          return false;
        }
      }
      return true;
    }),
    onFilterChange,
  };
};

type InsertableNodeProps = {
  node: AvailableNode;
  projectDir: string;
};

const InsertableNode = memo(({ node, projectDir }: InsertableNodeProps) => {
  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      type: "insertableNode",
      item: node,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [node]
  );

  return (
    <div ref={dragPreview}>
      <styles.Item
        ref={drag}
        isText={node.kind === AvailableNodeKind.Text}
        isElement={node.kind === AvailableNodeKind.Element}
        isComponent={node.kind === AvailableNodeKind.Instance}
        title={node.name}
        description={node.description || getSourceDesc(node, projectDir)}
      />
    </div>
  );
});

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
