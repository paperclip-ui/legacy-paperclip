import { Html5Entities } from "html-entities";
import { stringifyCSSRule, stringifyCSSSheet } from "paperclip-utils";
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
  node,
  factory: DOMFactory,
  resolveUrl: UrlResolver,
  namespaceURI: string
) => {
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
        return createNativeElement(node, factory, resolveUrl, namespaceURI);
      case "StyleElement":
        return createNativeStyleFromSheet(node.sheet, factory, resolveUrl);
      case "Fragment":
        return createNativeFragment(node, factory, resolveUrl);
    }
  } catch (e) {
    return factory.createTextNode(String(e.stack));
  }
};

let _dummyStyle: HTMLStyleElement;

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

  // fix case where certain rules are invalid - e.g: &:within(:not(.on)) does some
  // funny stuff.
  const ruleTexts = sheet.rules
    .map(rule => stringifyCSSRule(rule, { resolveUrl }))
    .map(text => {
      // OOF! This is expensive! This should be done in the rust engine instead. Not here!
      const isValid = ruleIsValid(text);

      // if (!isValid) {
      //   console.error(`invalid CSS rule: ${text}`);
      // }
      return isValid ? text : ".invalid-rule { }";
    });

  nativeElement.textContent = ruleTexts.join("\n");

  return nativeElement as HTMLStyleElement;
};

const createNativeTextNode = (node, factory: DOMFactory) => {
  // fixes https://github.com/crcn/paperclip/issues/609
  return factory.createTextNode(
    entities.decode(node.value.replace(/[\s\r]+/g, " "))
  );
};

const createNativeElement = (
  element,
  factory: DOMFactory,
  resolveUrl: UrlResolver,
  namespaceUri?: string
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
  for (const child of element.children) {
    nativeElement.appendChild(
      createNativeNode(child, factory, resolveUrl, childNamespaceUri)
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
  resolveUrl: UrlResolver
) => {
  const nativeFragment = factory.createDocumentFragment() as any;
  for (const child of fragment.children) {
    nativeFragment.appendChild(
      createNativeNode(child, factory, resolveUrl, nativeFragment.namespaceURI)
    );
  }
  return nativeFragment;
};
