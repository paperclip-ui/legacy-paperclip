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
    const target = getTarget(mount, mutation);
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
        const parent = (target as ChildNode).parentNode;
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

const getTarget = (mount: Patchable, mutation: Mutation) =>
  mutation.nodePath.reduce(
    (current: Patchable, i) => current.childNodes[i],
    mount
  );
