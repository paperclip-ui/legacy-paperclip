// FYI this code is super dumb and can definitely be made faster

import {
  LoadedData,
  LoadedPCData,
  Node,
  NodeKind,
  Sheet,
  stringifyCSSRule,
  VirtSheet,
  VirtualElement,
  VirtualNode,
  VirtualNodeKind
} from "@paperclip-ui/utils";
import { DOMFactory } from "./base";
import {
  createNativeNode,
  createNativeStyleFromSheet,
  UrlResolver
} from "./native-renderer";

const IMP_STYLE_INDEX = 0;
const DOC_STYLE_INDEX = 1;
const STAGE_INDEX = 2;

export type FrameInfo = {
  container: HTMLElement;
};

export type RenderFrameOptions = {
  domFactory: DOMFactory;
  resolveUrl?: UrlResolver;
};

export const renderFrames = (
  data: LoadedPCData,
  options: RenderFrameOptions
): HTMLElement[] => {
  const frames: HTMLElement[] = [];
  const documentStyles = renderDocumentStyles(data, options);
  const importedStyles = renderImportedStyles(data, options);

  const dataFrames =
    data.preview.kind === VirtualNodeKind.Fragment
      ? data.preview.children
      : [data.preview];

  for (const dataFrame of dataFrames) {
    frames.push(
      renderFrame(data, dataFrame, importedStyles, documentStyles, options)
    );
  }

  return frames;
};

const renderFrame = (
  data: LoadedPCData,
  node: VirtualNode,
  importedStyles: HTMLElement,
  documentStyles: HTMLElement,
  options: RenderFrameOptions
) => {
  const frame = options.domFactory.createElement("div");
  frame.appendChild(importedStyles.cloneNode(true));
  frame.appendChild(documentStyles.cloneNode(true));
  const stage = options.domFactory.createElement("div");
  stage.appendChild(
    createNativeNode(node, options.domFactory, options.resolveUrl, null)
  );
  frame.appendChild(stage);
  return frame;
};

const renderDocumentStyles = (
  data: LoadedPCData,
  { domFactory, resolveUrl }: RenderFrameOptions
) => {
  const container = domFactory.createElement("div");
  container.appendChild(
    createNativeStyleFromSheet(data.sheet, domFactory, resolveUrl)
  );
  return container;
};

const renderImportedStyles = (
  data: LoadedPCData,
  { domFactory, resolveUrl }: RenderFrameOptions
) => {
  const container = domFactory.createElement("div");
  for (const info of data.importedSheets) {
    const sheet = createNativeStyleFromSheet(
      info.sheet,
      domFactory,
      resolveUrl
    );
    sheet.setAttribute(`data-source`, info.uri);
    sheet.setAttribute(`data-index`, String(info.index));
    container.appendChild(sheet);
  }
  return container;
};

export const patchFrames = (
  frames: HTMLElement[],
  previousData: LoadedPCData,
  newData: LoadedPCData,
  options: RenderFrameOptions
) => {
  if (newData === previousData) {
    return frames;
  }
  frames = patchHTML(frames, previousData, newData, options);

  return frames;
};

const patchHTML = (
  frames: HTMLElement[],
  previousData: LoadedPCData,
  newData: LoadedPCData,
  options: RenderFrameOptions
) => {
  const prevVirtFrames = getFragmentChildren(previousData.preview);
  const newVirtFrames = getFragmentChildren(newData.preview);
  const newFrames: HTMLElement[] = [];
  const low = Math.min(prevVirtFrames.length, newVirtFrames.length);

  for (let i = 0; i < low; i++) {
    patchRoot(
      frames[i],
      previousData,
      newData,
      prevVirtFrames[i],
      newVirtFrames[i],
      options
    );
    newFrames.push(frames[i]);
  }

  // insert
  if (prevVirtFrames.length < newVirtFrames.length) {
    const documentStyles = renderDocumentStyles(newData, options);
    const importedStyles = renderImportedStyles(newData, options);
    for (let i = prevVirtFrames.length; i < newVirtFrames.length; i++) {
      newFrames.push(
        renderFrame(
          newData,
          newVirtFrames[i],
          importedStyles,
          documentStyles,
          options
        )
      );
    }
  }

  return newFrames;
};

const patchRoot = (
  frame: HTMLElement,
  previousData: LoadedPCData,
  newData: LoadedPCData,
  prevVirtNode: VirtualNode,
  currVirtNode: VirtualNode,
  options: RenderFrameOptions
) => {
  if (previousData.sheet !== newData.sheet) {
    patchDocumentSheet(frame, previousData, newData, options);
  }

  if (previousData.importedSheets !== newData.importedSheets) {
    patchImportedSheets(frame, previousData, newData, options);
  }

  const prevChildren = getFragmentChildren(prevVirtNode);
  const currChildren = getFragmentChildren(currVirtNode);

  patchChildren(
    frame.childNodes[STAGE_INDEX] as HTMLElement,
    prevChildren,
    currChildren,
    options
  );
};

const patchDocumentSheet = (
  frame: HTMLElement,
  previousData: LoadedPCData,
  newData: LoadedPCData,
  options: RenderFrameOptions
) => {
  const styleContainer = frame.childNodes[DOC_STYLE_INDEX] as HTMLDivElement;
  patchCSSStyleSheet(
    (styleContainer.childNodes[0] as HTMLStyleElement).sheet,
    previousData.sheet,
    newData.sheet,
    options
  );
};

const calcAryPatch = <TItem>(oldItems: TItem[], newItems: TItem[]) => {
  const low = Math.min(oldItems.length, newItems.length);
  const update = Array.from({ length: low }).map((v, i) => [
    oldItems[i],
    newItems[i]
  ]);
  const insert = newItems.slice(oldItems.length);
  const removeCount = Math.max(oldItems.length - newItems.length, 0);

  return { update, insert, removeCount };
};

const patchImportedSheets = (
  frame: HTMLElement,
  previousData: LoadedPCData,
  newData: LoadedPCData,
  options: RenderFrameOptions
) => {
  const styleContainer = frame.childNodes[IMP_STYLE_INDEX] as HTMLDivElement;

  const { update, insert, removeCount } = calcAryPatch(
    previousData.importedSheets,
    newData.importedSheets
  );

  for (let i = 0; i < update.length; i++) {
    const [oldItem, newItem] = update[i];
    if (oldItem !== newItem) {
      patchCSSStyleSheet(
        (styleContainer.childNodes[i] as HTMLStyleElement).sheet,
        oldItem.sheet,
        newItem.sheet,
        options
      );
    }
  }

  for (const item of insert) {
    styleContainer.appendChild(
      createNativeStyleFromSheet(
        item.sheet,
        options.domFactory,
        options.resolveUrl
      )
    );
  }

  for (let i = removeCount; i--; ) {
    styleContainer.lastChild.remove();
  }
};

const patchCSSStyleSheet = (
  sheet: CSSStyleSheet,
  prevSheet: VirtSheet,
  newSheet: VirtSheet,
  options: RenderFrameOptions
) => {
  const { update, insert, removeCount } = calcAryPatch(
    prevSheet.rules,
    newSheet.rules
  );

  const low = Math.min(prevSheet.rules.length, newSheet.rules.length);

  for (let i = 0; i < update.length; i++) {
    const [oldItem, newItem] = update[i];
    if (oldItem !== newItem) {
      sheet.deleteRule(i);
      insertRule(sheet, stringifyCSSRule(newItem, options), i);
    }
  }

  for (const item of insert) {
    insertRule(sheet, stringifyCSSRule(item, options));
  }
  for (let i = removeCount; i--; ) {
    sheet.deleteRule(sheet.cssRules.length - 1);
  }
};

const insertRule = (sheet: CSSStyleSheet, rule: string, index?: number) => {
  try {
    sheet.insertRule(rule, index == null ? sheet.cssRules.length : index);
  } catch (e) {
    sheet.insertRule(".nil {}");
  }
};

const patchNode = (
  node: HTMLElement | Text,
  prevVirtNode: VirtualNode,
  currVirtNode: VirtualNode,
  options: RenderFrameOptions
) => {
  if (prevVirtNode === currVirtNode) {
    return node;
  }

  if (
    prevVirtNode.kind !== currVirtNode.kind ||
    (prevVirtNode.kind === VirtualNodeKind.Element &&
      prevVirtNode.tagName !== (currVirtNode as VirtualElement).tagName)
  ) {
    const repl = createNativeNode(
      currVirtNode,
      options.domFactory,
      options.resolveUrl,
      (node as HTMLElement).namespaceURI
    );
    node.parentNode.insertBefore(repl, node);
    node.parentNode.removeChild(node);
  } else {
    if (prevVirtNode.kind === VirtualNodeKind.Element) {
      patchElement(
        node as HTMLElement,
        prevVirtNode,
        currVirtNode as VirtualElement,
        options
      );
    } else if (currVirtNode.kind === VirtualNodeKind.Text) {
      (node as Text).nodeValue = currVirtNode.value;
    }
  }

  return node;
};

const patchElement = (
  node: HTMLElement,
  prev: VirtualElement,
  curr: VirtualElement,
  options: RenderFrameOptions
) => {
  patchAttributes(node, prev, curr, options);
  patchChildren(node as HTMLElement, prev.children, curr.children, options);
};

const patchAttributes = (
  node: HTMLElement,
  prev: VirtualElement,
  curr: VirtualElement,
  options: RenderFrameOptions
) => {
  for (const key in curr.attributes) {
    node.setAttribute(key, curr.attributes[key]);
  }
  for (const key in prev.attributes) {
    if (curr.attributes[key] == null) {
      node.removeAttribute(key);
    }
  }
};

const patchChildren = (
  parent: HTMLElement,
  prev: VirtualNode[],
  curr: VirtualNode[],
  options: RenderFrameOptions
) => {
  const low = Math.min(prev.length, curr.length);

  for (let i = 0; i < low; i++) {
    patchNode(parent.childNodes[i] as any, prev[i], curr[i], options);
  }

  // insert
  if (prev.length < curr.length) {
    for (let i = prev.length; i < curr.length; i++) {
      parent.appendChild(
        createNativeNode(curr[i], options.domFactory, options.resolveUrl, null)
      );
    }
  } else {
    for (let i = curr.length; i < prev.length; i++) {
      parent.lastChild.remove();
    }
  }
};

const getFragmentChildren = (node: VirtualNode) =>
  node.kind === VirtualNodeKind.Fragment ? node.children : [node];
