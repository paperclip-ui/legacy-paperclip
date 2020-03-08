import { Html5Entities } from "html-entities";
import { stringifyCSSSheet } from "paperclip/lib/stringify-sheet";
import { preventDefault } from "./utils";

const entities = new Html5Entities();

export type DOMNodeMap = Map<Node, string>;

export const getNativeNodePath = (root: Node, node: Node) => {
  let path: number[] = [];
  let current = node;

  while (current.parentNode !== root) {
    path.unshift(Array.prototype.indexOf.call(current.parentNode.childNodes, current));
    current = current.parentNode;
  }

  return path;
};

export const createNativeNode = (
  node,
  protocol: string | null
) => {
  if (!node) {
    return document.createTextNode("");
  }
  try {
    switch (node.kind) {
      case "Text": {
        const text = createNativeTextNode(node);
        return text;
      }
      case "Element":
        return createNativeElement(node, protocol);
      case "StyleElement":
        return createNativeStyle(node, protocol);
      case "Fragment":
        return createNativeFragment(node, protocol);
    }
  } catch (e) {
    return document.createTextNode(String(e.stack));
  }
};

const createNativeTextNode = node => {
  return document.createTextNode(entities.decode(node.value));
};

const createNativeStyle = (element, protocol: string) => {
  // return document.createTextNode(JSON.stringify(element.sheet, null, 2));
  // return document.createTextNode(stringifyCSSSheet(element.sheet, protocol));
  const nativeElement = document.createElement("style");
  nativeElement.textContent = stringifyCSSSheet(element.sheet, protocol);
  return nativeElement;
};

const createNativeElement = (element, protocol: string) => {
  // return document.createTextNode(JSON.stringify(element, null, 2));
  const nativeElement = document.createElement(element.tagName);
  for (let { name, value } of element.attributes) {
    if (name === "src" && protocol) {
      value = value.replace(/\w+:/, protocol);
    }

    nativeElement.setAttribute(name, value);
  }
  for (const child of element.children) {
    nativeElement.appendChild(createNativeNode(child, protocol));
  }

  // prevent redirects & vscode from asking to redirect.
  if (element.tagName === "a") {
    nativeElement.onclick = preventDefault;
    nativeElement.onmouseup = preventDefault;
    nativeElement.onmousedown = preventDefault;
  }
  return nativeElement;
};

const createNativeFragment = (fragment, protocol: string) => {
  const nativeFragment = document.createDocumentFragment();
  for (const child of fragment.children) {
    nativeFragment.appendChild(createNativeNode(child, protocol));
  }
  return nativeFragment;
};
