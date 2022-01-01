import { VirtualNode, VirtualNodeKind } from "paperclip-utils";

export const traverseVirtNode = (
  node: VirtualNode,
  each: (node: VirtualNode, path: number[]) => void,
  path = []
) => {
  each(node, path);
  if (
    node.kind === VirtualNodeKind.Element ||
    node.kind === VirtualNodeKind.Fragment
  ) {
    for (let i = 0, { length } = node.children; i < length; i++) {
      const child = node.children[i];
      traverseVirtNode(child, each, [...path, i]);
    }
  }
};
