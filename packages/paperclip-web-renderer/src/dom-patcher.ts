import { Html5Entities } from "html-entities";
import { createNativeNode } from "./native-renderer";
import {
  Mutation,
  ActionKind,
  NodeKind,
  VirtualNodeKind,
} from "@paperclip-ui/utils";
import { DOMFactory } from "./renderer";
import { ATTR_ALIASES } from "./utils";

const entities = new Html5Entities();

export interface Patchable {
  childNodes: ChildNode[] | NodeListOf<ChildNode>;
  appendChild(child: Node);
  removeChild(child: Node);
  insertBefore(child: Node, before: Node);
  namespaceURI: any;
}

export const patchNativeNode = (
  mount: Patchable,
  mutations: Mutation[],
  factory: DOMFactory,
  showSlotPlaceholders: boolean,
  resolveUrl: (url: string) => string
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
          resolveUrl,
          target.namespaceURI,
          showSlotPlaceholders
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
            resolveUrl,
            parent.namespaceURI,
            showSlotPlaceholders
          ),
          target as any as ChildNode
        );

        parent.removeChild(target as any as ChildNode);
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
          value = resolveUrl(value);
        }
        element.setAttribute(aliasName, value);
        break;
      }
      case ActionKind.SetText: {
        const text = target as any as Text;

        // fixes https://github.com/paperclipui/paperclip/issues/609
        text.nodeValue = entities.decode(action.value.replace(/[\s\r]+/g, " "));
        break;
      }
    }
  }
};

const getTargetFromPath = (mount: Patchable, nodePath: number[]): Patchable =>
  nodePath.reduce(
    (current: Patchable, i) => current.childNodes[i] as any,
    mount
  ) as any as Patchable;
