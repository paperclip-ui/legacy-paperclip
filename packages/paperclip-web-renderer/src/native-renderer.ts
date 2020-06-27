import { Html5Entities } from "html-entities";
import { stringifyCSSSheet } from "paperclip-utils";
import { preventDefault, ATTR_ALIASES } from "./utils";
import { DOMFactory } from "./renderer";

const entities = new Html5Entities();

export type DOMNodeMap = Map<Node, string>;
const XMLNS_NAMESPACE = "http://www.w3.org/2000/svg";

export const getNativeNodePath = (root: Node, node: Node) => {
  let path: number[] = [];

  let current = node;

  while (current.parentNode !== root) {
    path.unshift(
      Array.prototype.indexOf.call(current.parentNode.childNodes, current)
    );
    current = current.parentNode;
  }

  return path;
};

export const createNativeNode = (
  node,
  factory: DOMFactory,
  protocol: string | null,
  namespaceURI: string
) => {
  // return document.createTextNode(JSON.stringify(node, null, 2));

  if (!node) {
    return factory.createTextNode("");
  }
  try {
    switch (node.kind) {
      case "Text": {
        const text = createNativeTextNode(node, factory);
        return text;
      }
      case "Element":
        return createNativeElement(node, factory, protocol, namespaceURI);
      case "StyleElement":
        return createNativeStyle(node, factory, protocol);
      case "Fragment":
        return createNativeFragment(node, factory, protocol);
    }
  } catch (e) {
    return factory.createTextNode(String(e.stack));
  }
};

export const createNativeStyleFromSheet = (
  sheet,
  factory: DOMFactory,
  protocol: string
) => {
  // return factory.createTextNode(JSON.stringify(element.sheet, null, 2));
  // return factory.createTextNode(stringifyCSSSheet(element.sheet, protocol));
  const nativeElement = factory.createElement("style");
  nativeElement.textContent = stringifyCSSSheet(sheet, protocol);
  return nativeElement;
};

const createNativeTextNode = (node, factory: DOMFactory) => {
  return factory.createTextNode(entities.decode(node.value));
};

const createNativeStyle = (element, factory: DOMFactory, protocol: string) => {
  // return factory.createTextNode(JSON.stringify(element.sheet, null, 2));
  // return factory.createTextNode(stringifyCSSSheet(element.sheet, protocol));
  const nativeElement = factory.createElement("style");
  nativeElement.textContent = stringifyCSSSheet(element.sheet, protocol);
  return nativeElement;
};

const createNativeElement = (
  element,
  factory: DOMFactory,
  protocol: string,
  namespaceUri?: string
) => {
  // return factory.createTextNode(JSON.stringify(element, null, 2));
  const nativeElement =
    element.tagName === "svg"
      ? document.createElementNS(XMLNS_NAMESPACE, "svg")
      : namespaceUri
      ? factory.createElementNS(namespaceUri, element.tagName)
      : factory.createElement(element.tagName);

  for (let name in element.attributes) {
    let value = element.attributes[name];
    if (name === "src" && protocol) {
      value = value.replace(/\w+:/, protocol);
    }

    const aliasName = ATTR_ALIASES[name] || name;

    nativeElement.setAttribute(aliasName, value);
  }
  for (const child of element.children) {
    nativeElement.appendChild(
      createNativeNode(child, factory, protocol, nativeElement.namespaceURI)
    );
  }

  // prevent redirects & vscode from asking to redirect.
  if (element.tagName === "a") {
    nativeElement.onclick = preventDefault;
    nativeElement.onmouseup = preventDefault;
    nativeElement.onmousedown = preventDefault;
  }
  return nativeElement;
};

const createNativeFragment = (
  fragment,
  factory: DOMFactory,
  protocol: string
) => {
  const nativeFragment = factory.createDocumentFragment();
  for (const child of fragment.children) {
    nativeFragment.appendChild(
      createNativeNode(child, factory, protocol, nativeFragment.namespaceURI)
    );
  }
  return nativeFragment;
};
