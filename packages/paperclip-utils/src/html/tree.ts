import { memoize } from "../core/memo";
import { nodePathToAry } from "./virt";

// core tree utils

// eslint-disable-next-line
export type BaseTreeNode = {};

export type BaseParentNode = {
  children: BaseTreeNode[];
} & BaseTreeNode;

export const isNodeParent = (node: BaseTreeNode): node is BaseParentNode =>
  (node as any).children != null;

export const flattenTreeNode = memoize(
  <TNode extends BaseTreeNode>(current: TNode): TNode[] => {
    const treeNodeMap = getTreeNodeMap(current);
    return Object.values(treeNodeMap);
  }
);

export const getNodePath = memoize(
  <TNode extends BaseTreeNode>(node: TNode, root: TNode) => {
    const map = getTreeNodeMap(root);
    for (const path in map) {
      const c = map[path];
      if (c === node) return path;
    }
  }
);

export const getNodeByPath = memoize(
  <TNode extends BaseTreeNode>(nodePath: string, root: TNode) => {
    return getTreeNodeMap(root)[nodePath];
  }
);

export const getNodeAncestors = memoize(
  <TNode extends BaseTreeNode>(nodePath: string, root: TNode) => {
    const pathAry = nodePathToAry(nodePath);
    const map = getTreeNodeMap(root);
    const ancestors = [];
    for (let i = pathAry.length; i--; ) {
      ancestors.push(getNodeByPath(pathAry.slice(0, i).join("."), root));
    }
    return ancestors;
  }
);

export const containsNode = <TNode extends BaseTreeNode>(
  node: TNode,
  root: TNode
) => getNodePath(node, root) != null;

export const getTreeNodeMap = memoize(
  <TNode extends BaseTreeNode>(
    current: TNode,
    path = ""
  ): Record<string, TNode> => {
    const map: Record<string, TNode> = {
      [path]: current
    };
    if (isNodeParent(current)) {
      Object.assign(
        map,
        ...current.children.map((child, i) =>
          getTreeNodeMap(child, path ? path + "." + i : String(i))
        )
      );
    }
    return map;
  }
);
