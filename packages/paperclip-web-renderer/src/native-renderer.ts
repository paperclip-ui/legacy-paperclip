import { Html5Entities } from "html-entities";
import {
  Element,
  Fragment,
  NodeKind,
  Slot,
  stringifyCSSRule,
  stringifyCSSSheet,
  VirtualElement,
  VirtualFragment,
  VirtualNode,
  VirtualNodeKind,
  VirtualSlot,
  ELEMENT_INSERT_ATTR,
} from "@paperclip-ui/utils";
import { preventDefault, ATTR_ALIASES } from "./utils";
import { DOMFactory } from "./renderer";

const entities = new Html5Entities();

export type DOMNodeMap = Map<Node, string>;
const XMLNS_NAMESPACE = "http://www.w3.org/2000/svg";

export const getNativeNodePath = (root: Node, node: Node) => {
  const path: number[] = [];

  let current = node;

  while (current.parentNode !== root) {
    path.unshift(
      Array.prototype.indexOf.call(current.parentNode.childNodes, current)
    );
    current = current.parentNode;
  }

  return path;
};

export type UrlResolver = (url: string) => string;

export const createNativeNode = (
  node: VirtualNode,
  factory: DOMFactory,
  resolveUrl: UrlResolver,
  namespaceURI: string,
  showSlotPlaceholders: boolean,
  inInstance?: boolean
) => {
  if (!node) {
    return factory.createTextNode("");
  }
  try {
    switch (node.kind) {
      case VirtualNodeKind.Text: {
        const text = createNativeTextNode(node, factory);
        return text;
      }
      case VirtualNodeKind.Element:
        return createNativeElement(
          node,
          factory,
          resolveUrl,
          namespaceURI,
          showSlotPlaceholders,
          inInstance
        );
      case VirtualNodeKind.StyleElement:
        return createNativeStyleFromSheet(node.sheet, factory, resolveUrl);
      case VirtualNodeKind.Fragment:
        return createNativeFragment(
          node,
          factory,
          resolveUrl,
          showSlotPlaceholders,
          inInstance
        );
      case VirtualNodeKind.Slot: {
        return createSlot(node, factory, showSlotPlaceholders, inInstance);
      }
    }
  } catch (e) {
    return factory.createTextNode(String(e.stack));
  }
};

let _dummyStyle: HTMLStyleElement;

const createSlot = (
  node: VirtualSlot,
  domFactory: DOMFactory,
  showSlotPlaceholders?: boolean,
  inInstance?: boolean
) => {
  if (!showSlotPlaceholders) {
    return domFactory.createTextNode("");
  }
  const placeholder = domFactory.createElement("div");
  addInsert(placeholder);
  return placeholder;
};

export const addInsert = (element: HTMLElement) => {
  element.setAttribute(
    "style",
    "border: 1px dashed #F0F; padding: 30px; box-sizing: border-box;"
  );
};

const ruleIsValid = (ruleText: string) => {
  if (typeof window === "undefined") {
    return true;
  }

  if (!_dummyStyle) {
    _dummyStyle = document.createElement("style") as HTMLStyleElement;
    document.head.appendChild(_dummyStyle);
  }

  try {
    (_dummyStyle.sheet as any).insertRule(ruleText, 0);
    (_dummyStyle.sheet as any).deleteRule(0);
  } catch (e) {
    return false;
  }

  return true;
};

export const createNativeStyleFromSheet = (
  sheet,
  factory: DOMFactory,
  resolveUrl: UrlResolver
) => {
  const nativeElement = factory.createElement("style") as HTMLStyleElement;

  nativeElement.textContent = renderSheetText(sheet, resolveUrl);

  return nativeElement as HTMLStyleElement;
};

export const renderSheetText = (sheet, resolveUrl: UrlResolver) => {
  return sheet.rules
    .map((rule) => stringifyCSSRule(rule, { resolveUrl }))
    .map((text) => {
      // OOF! This is expensive! This should be done in the rust engine instead. Not here!
      const isValid = ruleIsValid(text);

      // if (!isValid) {
      //   console.error(`invalid CSS rule: ${text}`);
      // }
      return isValid ? text : ".invalid-rule { }";
    })
    .join("\n");
};

const createNativeTextNode = (node, factory: DOMFactory) => {
  // fixes https://github.com/paperclipui/paperclip/issues/609
  return factory.createTextNode(
    entities.decode(node.value.replace(/[\s\r]+/g, " "))
  );
};

const createNativeElement = (
  element: VirtualElement,
  factory: DOMFactory,
  resolveUrl: UrlResolver,
  namespaceUri?: string,
  showSlotPlaceholders?: boolean,
  inInstance?: boolean
) => {
  const nativeElement =
    element.tagName === "svg"
      ? document.createElementNS(XMLNS_NAMESPACE, "svg")
      : namespaceUri
      ? factory.createElementNS(namespaceUri, element.tagName)
      : factory.createElement(element.tagName);

  const childNamespaceUri =
    element.tagName === "svg" ? XMLNS_NAMESPACE : namespaceUri;

  for (const name in element.attributes) {
    let value = element.attributes[name];
    if (name === "src" && resolveUrl) {
      value = resolveUrl(value);
    }

    const aliasName = ATTR_ALIASES[name] || name;

    nativeElement.setAttribute(aliasName, value);
  }

  if (element.attributes[ELEMENT_INSERT_ATTR]) {
    addInsert(nativeElement as HTMLElement);
  }

  for (const child of element.children) {
    nativeElement.appendChild(
      createNativeNode(
        child,
        factory,
        resolveUrl,
        childNamespaceUri,
        showSlotPlaceholders,
        inInstance ||
          Boolean(element.sourceInfo && element.sourceInfo.instanceOf)
      )
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
  fragment: VirtualFragment,
  factory: DOMFactory,
  resolveUrl: UrlResolver,
  showSlotPlaceholders?: boolean,
  inInstance?: boolean
) => {
  const nativeFragment = factory.createDocumentFragment() as any;
  for (const child of fragment.children) {
    nativeFragment.appendChild(
      createNativeNode(
        child,
        factory,
        resolveUrl,
        nativeFragment.namespaceURI,
        showSlotPlaceholders,
        inInstance
      )
    );
  }
  return nativeFragment;
};
