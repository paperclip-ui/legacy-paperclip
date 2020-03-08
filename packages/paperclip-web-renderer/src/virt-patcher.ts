import { DOMNodeMap, createNativeNode } from "./native-renderer";
import { Mutation, ActionKind } from "paperclip/src/virt-mtuation";
import { VirtualNode, VirtualElement, VirtualText } from "paperclip/src/virt";


export const patchVirtNode = (root: VirtualElement, mutations: Mutation[]) => {
  for (const mutation of mutations) {
    let target = getVirtTarget(root, mutation.nodePath);
    const action = mutation.action;
    switch(action.kind) {
      case ActionKind.DeleteChild: {
        const element = target as VirtualElement;
        const children = element.children.concat();
        children.splice(action.index, 1);
        target = {...target, children};
        break;
      }
      case ActionKind.InsertChild: {
        const element = target as VirtualElement;
        const children = element.children.concat();
        children.splice(action.index, 0, action.child);
        target = {...target, children};
        break;
      }
      case ActionKind.RemoveAttribute: {
        const element = target as VirtualElement;
        target = {...target, attributes: element.attributes.filter(attr => attr.name !== action.name)};
        break;
      }
      case ActionKind.SetAttribute: {
        const element = target as VirtualElement;
        const attributes = element.attributes.concat();
        const existing = attributes.find(attr => attr.name !== action.name);
        if (existing) {
          attributes.splice(attributes.indexOf(existing), 1, {
            ...existing,
            value: action.value
          });
        } else {
          attributes.push({
            name: action.name,
            value: action.value
          });
        }
        target = {
          ...target,
          attributes,
        }
        break;
      }
      case ActionKind.SetText: {
        target = {...target, value: action.value};
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

export const getVirtTarget = (mount: VirtualElement, nodePath: number[]): VirtualNode => nodePath.reduce((current: VirtualElement, i) => current.children[i], mount);
const updateNode = (ancestor: VirtualElement, nodePath: number[], newNode: VirtualNode, depth: number = -1) => {
  if (depth === nodePath.length) {
    return newNode;
  }
  return {
    ...ancestor,
    children: [
      ...ancestor.children.slice(0, nodePath[depth]),
      newNode,
      ...ancestor.children.slice(nodePath[depth])
    ]
  }
};