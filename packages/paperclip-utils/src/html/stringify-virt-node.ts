import { stringifyCSSSheet } from "../css/stringify-sheet";
import { VirtualNode } from "./virt";
import { Html5Entities } from "html-entities";
import { VirtualNodeKind } from "..";

const entities = new Html5Entities();

export const stringifyVirtualNode = (
  node: VirtualNode,
  slotPlaceholder = ""
) => {
  switch (node.kind) {
    case VirtualNodeKind.Fragment:
      return stringifyChildren(node, slotPlaceholder);
    case VirtualNodeKind.Element: {
      let buffer = `<${node.tagName}`;
      for (const key in node.attributes) {
        const value = node.attributes[key];
        if (value) {
          buffer += ` ${key}="${value}"`;
        } else {
          buffer += ` ${key}`;
        }
      }
      buffer += `>${stringifyChildren(node, slotPlaceholder)}</${
        node.tagName
      }>`;
      return buffer;
    }
    case VirtualNodeKind.StyleElement: {
      return `<style>${stringifyCSSSheet(node.sheet)}</style>`;
    }
    case VirtualNodeKind.Text: {
      return entities.decode(node.value);
    }
    case VirtualNodeKind.Slot: {
      return slotPlaceholder;
    }
    default: {
      throw new Error(`can't handle node`);
    }
  }
};

const stringifyChildren = (node, slotPlaceholder) =>
  node.children
    .map((child) => stringifyVirtualNode(child, slotPlaceholder))
    .join("");
