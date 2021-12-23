import { stringifyCSSSheet } from "../css/stringify-sheet";
import { VirtualNode } from "./virt";
import { Html5Entities } from "html-entities";

const entities = new Html5Entities();

export const stringifyVirtualNode = (node: VirtualNode) => {
  switch (node.kind) {
    case "Fragment":
      return stringifyChildren(node);
    case "Element": {
      let buffer = `<${node.tagName}`;
      for (const key in node.attributes) {
        const value = node.attributes[key];
        if (value) {
          buffer += ` ${key}="${value}"`;
        } else {
          buffer += ` ${key}`;
        }
      }
      buffer += `>${stringifyChildren(node)}</${node.tagName}>`;
      return buffer;
    }
    case "StyleElement": {
      return `<style>${stringifyCSSSheet(node.sheet)}</style>`;
    }
    case "Text": {
      return entities.decode(node.value);
    }
    default: {
      throw new Error(`can't handle ${node.kind}`);
    }
  }
};

const stringifyChildren = node =>
  node.children.map(stringifyVirtualNode).join("");
