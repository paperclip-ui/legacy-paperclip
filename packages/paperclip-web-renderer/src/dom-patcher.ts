import { DOMNodeMap, createNativeNode } from "./native-renderer";
import { Mutation, ActionKind } from "paperclip/src/virt-mtuation";

export const patchNativeNode = (mount: HTMLElement, mutations: Mutation[], protocol: string | null) => {

  mount.appendChild(document.createTextNode(JSON.stringify(mutations)));
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
        const newChild = createNativeNode(action.child, protocol);
        if (action.index >= target.childNodes.length) {
          target.appendChild(newChild);
        } else {
          target.insertBefore(newChild, target.childNodes[action.index]);
        }
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
        mount.appendChild(document.createTextNode("FOUND IT"));
        break;
      }
    } 
  }
};  

const getTarget = (mount: HTMLElement, mutation: Mutation) => mutation.nodePath.reduce((current: HTMLElement, i) => current.childNodes[i], mount);