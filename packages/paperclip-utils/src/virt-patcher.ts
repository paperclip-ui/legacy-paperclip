import { Mutation, ActionKind } from "./virt-mtuation";
import {
  VirtualNode,
  VirtualElement,
  VirtualText,
  VirtualNodeKind
} from "./virt";
import { getChildren } from "./ast";

export const patchVirtNode = (root: VirtualNode, mutations: Mutation[]) => {
  for (const mutation of mutations) {
    let target = getVirtTarget(root, mutation.nodePath);
    const action = mutation.action;
    switch (action.kind) {
      case ActionKind.DeleteChild: {
        const element = target as VirtualElement;
        const children = element.children.concat();
        children.splice(action.index, 1);
        target = { ...target, children } as VirtualElement;
        break;
      }
      case ActionKind.InsertChild: {
        const element = target as VirtualElement;
        const children = element.children.concat();
        children.splice(action.index, 0, action.child);
        target = { ...target, children } as VirtualElement;
        break;
      }
      case ActionKind.ReplaceNode: {
        target = action.replacement;
        break;
      }
      case ActionKind.RemoveAttribute: {
        const element = target as VirtualElement;
        const attributes = { ...element.attributes };
        attributes[action.name] = undefined;
        target = {
          ...target,
          attributes
        } as VirtualElement;
        break;
      }
      case ActionKind.SetAttribute: {
        const element = target as VirtualElement;
        const attributes = { ...element.attributes };
        attributes[action.name] = action.value;
        target = {
          ...target,
          attributes
        } as VirtualElement;
        break;
      }
      case ActionKind.SetText: {
        target = { ...target, value: action.value } as VirtualText;
        break;
      }
      case ActionKind.SourceChanged: {
        const element = target as VirtualElement;
        // target = {...element, a: element.attributes}
      }
    }

    root = updateNode(root, mutation.nodePath, target) as VirtualElement;
  }
  return root;
};

export const getVirtTarget = (
  mount: VirtualNode,
  nodePath: number[]
): VirtualNode =>
  nodePath.reduce((current: VirtualElement, i) => current.children[i], mount);

const updateNode = (
  ancestor: VirtualNode,
  nodePath: number[],
  newNode: VirtualNode,
  depth = 0
) => {
  if (depth === nodePath.length) {
    return newNode;
  }
  if (
    ancestor.kind === VirtualNodeKind.Text ||
    ancestor.kind === VirtualNodeKind.StyleElement
  ) {
    return newNode;
  }
  return {
    ...ancestor,
    children: [
      ...ancestor.children.slice(0, nodePath[depth]),
      updateNode(
        ancestor.children[nodePath[depth]] as VirtualElement,
        nodePath,
        newNode,
        depth + 1
      ),
      ...ancestor.children.slice(nodePath[depth] + 1)
    ]
  };
};
