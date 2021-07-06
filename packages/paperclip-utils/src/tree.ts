import { memoize } from "./memo";

// core tree utils

// eslint-disable-next-line
export type BaseNode = {};

export type BaseParentNode = {
  children: BaseNode[];
} & BaseNode;

export const isNodeParent = (node: BaseNode): node is BaseParentNode =>
  (node as any).children != null;

export const flattenTreeNode = memoize(
  <TNode extends BaseNode>(current: TNode): TNode[] => {
    const treeNodeMap = getTreeNodeMap(current);
    return Object.values(treeNodeMap);
  }
);

export const getNodePath = memoize(
  <TNode extends BaseNode>(node: TNode, root: TNode) => {
    const map = getTreeNodeMap(root);
    for (const path in map) {
      const c = map[path];
      if (c === node) return path;
    }
  }
);

export const containsNode = <TNode extends BaseNode>(
  node: TNode,
  root: TNode
) => getNodePath(node, root) != null;

export const getTreeNodeMap = memoize(
  <TNode extends BaseNode>(
    current: TNode,
    path = "0"
  ): Record<string, TNode> => {
    const map: Record<string, TNode> = {
      [path]: current
    };
    if (isNodeParent(current)) {
      Object.assign(
        map,
        ...current.children.map((child, i) =>
          getTreeNodeMap(child, path + "." + i)
        )
      );
    }
    return map;
  }
);
