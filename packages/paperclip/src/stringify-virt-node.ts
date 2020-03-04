import { stringifyCSSSheet } from "./stringify-sheet";

export const stringifyVirtualNode = node => {
  switch (node.kind) {
    case "Fragment":
      return stringifyChildren(node);
    case "Element": {
      let buffer = `<${node.tagName}`;
      for (const attr of node.attributes) {
        if (attr.value) {
          buffer += ` ${attr.name}="${attr.value}"`;
        } else {
          buffer += ` ${attr.name}`;
        }
      }
      buffer += `>${stringifyChildren(node)}</${node.tagName}>`;
      return buffer;
    }
    case "StyleElement": {
      return `<style>${stringifyCSSSheet(node.sheet, null)}</style>`;
    }
    case "Text": {
      return node.value;
    }
    default: {
      throw new Error(`can't handle ${node.kind}`);
    }
  }
};

const stringifyChildren = node =>
  node.children.map(stringifyVirtualNode).join("");
