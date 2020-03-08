import { DOMNodeMap, createNativeNode } from "./native-renderer";
import { Mutation, ActionKind } from "paperclip-utils";
import { DOMFactory } from "./renderer";

export const patchNativeNode = (mount: HTMLElement, mutations: Mutation[], factory: DOMFactory, protocol: string | null) => {
  for (const mutation of mutations) {
    const target = getTarget(mount, mutation);
    const action = mutation.action;
    switch(action.kind) {
      case ActionKind.DeleteChild: {
        const child = target.childNodes[action.index];
        target.removeChild(child);
        break;
      }
      case ActionKind.InsertChild: {
        const newChild = createNativeNode(action.child, factory, protocol);
        if (action.index >= target.childNodes.length) {
          target.appendChild(newChild);
        } else {
          target.insertBefore(newChild, target.childNodes[action.index]);
        }
        break;
      }
      case ActionKind.ReplaceNode: {
        const parent = target.parentNode;
        parent.insertBefore(createNativeNode(action.replacement, factory, protocol), target);

        target.remove();
        break;
      }
      case ActionKind.RemoveAttribute: {
        const element = target as HTMLElement;
        element.removeAttribute(action.name);
        break;
      }
      case ActionKind.SetAttribute: {
        const element = target as HTMLElement;
        element.setAttribute(action.name, action.value || "");
        break;
      }
      case ActionKind.SetText: {
        const text = target as Text;
        text.nodeValue = action.value;
        break;
      }
    } 
  }
  console.log(mount.innerHTML);
};  

const getTarget = (mount: HTMLElement, mutation: Mutation) => mutation.nodePath.reduce((current: HTMLElement, i) => current.childNodes[i], mount);