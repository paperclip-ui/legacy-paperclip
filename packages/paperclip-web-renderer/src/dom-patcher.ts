import { Html5Entities } from "html-entities";
import { createNativeNode } from "./native-renderer";
import { Mutation, ActionKind } from "paperclip-utils";
import { DOMFactory } from "./renderer";
import { ATTR_ALIASES } from "./utils";

const entities = new Html5Entities();

export interface Patchable {
  childNodes: ChildNode[] | NodeListOf<ChildNode>;
  appendChild(child: Node);
  removeChild(child: Node);
  insertBefore(child: Node, before: Node);
  namespaceURI: string;
}

export const patchNativeNode = (
  mount: Patchable,
  mutations: Mutation[],
  factory: DOMFactory,
  protocol: string | null
) => {
  for (const mutation of mutations) {
    const target = getTargetFromPath(mount, mutation.nodePath);
    const action = mutation.action;
    switch (action.kind) {
      case ActionKind.DeleteChild: {
        const child = target.childNodes[action.index];
        target.removeChild(child);
        break;
      }
      case ActionKind.InsertChild: {
        const newChild = createNativeNode(
          action.child,
          factory,
          protocol,
          target.namespaceURI
        );
        if (action.index >= target.childNodes.length) {
          target.appendChild(newChild);
        } else {
          target.insertBefore(newChild, target.childNodes[action.index]);
        }
        break;
      }
      case ActionKind.ReplaceNode: {
        // Need to use this method instead of parentNode since parent may not be DOM element (FramesProxy)
        const parent = getTargetFromPath(
          mount,
          mutation.nodePath.slice(0, mutation.nodePath.length - 1)
        );
        parent.insertBefore(
          createNativeNode(
            action.replacement,
            factory,
            protocol,
            parent.namespaceURI
          ),
          target as ChildNode
        );

        parent.removeChild(target as ChildNode);
        break;
      }
      case ActionKind.RemoveAttribute: {
        const element = target as HTMLElement;
        element.removeAttribute(ATTR_ALIASES[action.name] || action.name);
        break;
      }
      case ActionKind.SetAttribute: {
        const element = target as HTMLElement;
        const aliasName = ATTR_ALIASES[action.name] || action.name;
        let value = action.value || "";
        if (value.indexOf("file:") === 0) {
          value = value.replace("file:", protocol);
        }
        element.setAttribute(aliasName, value);
        break;
      }
      case ActionKind.SetText: {
        const text = target as Text;
        text.nodeValue = entities.decode(action.value);
        break;
      }
    }
  }
};

const getTargetFromPath = (mount: Patchable, nodePath: number[]) =>
  nodePath.reduce((current: Patchable, i) => current.childNodes[i], mount);
