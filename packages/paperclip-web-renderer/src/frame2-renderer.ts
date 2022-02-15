// FYI this code is super dumb and can definitely be made faster

import {
  ELEMENT_INSERT_ATTR,
  LoadedData,
  LoadedPCData,
  memoize,
  Node,
  NodeKind,
  Sheet,
  stringifyCSSRule,
  StyleRule,
  VirtSheet,
  VirtualElement,
  VirtualFrame,
  VirtualNode,
  VirtualNodeKind,
} from "@paperclip-ui/utils";
import { Box, DOMFactory } from "./base";
import {
  addInsert,
  createNativeNode,
  createNativeStyleFromSheet,
  renderSheetText,
  UrlResolver,
} from "./native-renderer";
import { getFrameBounds, traverseNativeNode } from "./utils";
import { Html5Entities } from "html-entities";
const entities = new Html5Entities();

const IMP_STYLE_INDEX = 0;
const DOC_STYLE_INDEX = 1;
const STAGE_INDEX = 2;

export type FrameInfo = {
  container: HTMLElement;
};

export type RenderFrameOptions = {
  showSlotPlaceholders?: boolean;
  domFactory: DOMFactory;
  resolveUrl?: UrlResolver;
};

export const renderFrames = (
  data: LoadedPCData,
  options: RenderFrameOptions
): HTMLElement[] => {
  return getFragmentChildren(data.preview).map((frame, index) => {
    return renderFrame(data, index, options);
  });
};

export const renderFrame = (
  data: LoadedPCData,
  index: number,
  options: RenderFrameOptions
) => {
  const { documentStyles, importedStyles } = createStyles(data, options);
  const dataFrames = getFragmentChildren(data.preview);
  return renderFrame2(
    data,
    dataFrames[index],
    importedStyles,
    documentStyles,
    options
  );
};

const createStyles = memoize(
  (data: LoadedPCData, options: RenderFrameOptions) => {
    const documentStyles = renderDocumentStyles(data, options);
    const importedStyles = renderImportedStyles(data, options);
    return { documentStyles, importedStyles };
  }
);

const renderFrame2 = (
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
    createNativeNode(
      node,
      options.domFactory,
      options.resolveUrl,
      null,
      options.showSlotPlaceholders
    )
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
  const prevVirtFrames = getFragmentChildren(previousData.preview);
  const newVirtFrames = getFragmentChildren(newData.preview);
  const { insert, update } = calcAryPatch(prevVirtFrames, newVirtFrames);
  const newFrames: HTMLElement[] = [];

  for (let i = 0; i < update.length; i++) {
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

  for (const newItem of insert) {
    newFrames.push(
      renderFrame(newData, newVirtFrames.indexOf(newItem), options)
    );
  }

  return newFrames;
};

export const patchFrame = (
  frame: HTMLElement,
  index: number,
  prev: LoadedPCData,
  curr: LoadedPCData,
  options: RenderFrameOptions
) => {
  const prevVirtFrames = getFragmentChildren(prev.preview);
  const newVirtFrames = getFragmentChildren(curr.preview);
  return patchRoot(
    frame,
    prev,
    curr,
    prevVirtFrames[index],
    newVirtFrames[index],
    options
  );
};

export const getFrameRects = (
  mount: HTMLElement,
  data: LoadedPCData,
  index: number
) => {
  const rects: Record<string, Box> = {};

  const frame = getFragmentChildren(data.preview)[index] as VirtualFrame;

  const bounds = getFrameBounds(frame);

  // mount child node _is_ the frame -- can only ever be one child
  traverseNativeNode(
    mount.childNodes[STAGE_INDEX].childNodes[0],
    (node, path) => {
      const pathStr = path.length ? index + "." + path.join(".") : index;
      let clientRect: DOMRect;
      if (node.nodeType === 1) {
        clientRect = (node as Element).getBoundingClientRect();
      } else if (node.nodeType === 3) {
        const range = document.createRange();
        range.selectNode(node);
        clientRect = range.getBoundingClientRect();
        range.detach();
      }

      if (clientRect) {
        rects[pathStr] = {
          width: clientRect.width,
          height: clientRect.height,
          x: clientRect.left + bounds.x,
          y: clientRect.top + bounds.y,
        };
      }
    }
  );

  // include frame sizes too
  rects[index] = bounds;

  return rects;
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
  const styleElement = styleContainer.childNodes[0] as HTMLStyleElement;
  patchStyleElement(styleElement, previousData.sheet, newData.sheet, options);
};

const patchStyleElement = (
  styleElement: HTMLStyleElement,
  prevSheet: VirtSheet,
  newSheet: VirtSheet,
  options: RenderFrameOptions
) => {
  if (styleElement.sheet) {
    patchCSSStyleSheet(styleElement.sheet, prevSheet, newSheet, options);
  } else {
    styleElement.textContent = renderSheetText(newSheet, options.resolveUrl);
  }
};

const calcAryPatch = <TItem>(oldItems: TItem[], newItems: TItem[]) => {
  const low = Math.min(oldItems.length, newItems.length);
  const update = Array.from({ length: low }).map((v, i) => [
    oldItems[i],
    newItems[i],
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
      patchStyleElement(
        styleContainer.childNodes[i] as HTMLStyleElement,
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

  for (let i = 0; i < update.length; i++) {
    const [oldItem, newItem] = update[i];
    if (
      oldItem !== newItem ||
      (sheet.cssRules[i] as CSSStyleRule).selectorText === ".nil"
    ) {
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
  const actualIndex = index == null ? sheet.cssRules.length : index;
  try {
    sheet.insertRule(rule, actualIndex);
  } catch (e) {
    sheet.insertRule(".nil{}", actualIndex);
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
      (node as HTMLElement).namespaceURI,
      options.showSlotPlaceholders
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
      (node as Text).nodeValue = entities.decode(
        currVirtNode.value.replace(/[\s\r]+/g, " ")
      );
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
    let value = curr.attributes[key];
    if (key === "src" && options.resolveUrl) {
      value = options.resolveUrl(value);
    }
    node.setAttribute(key, value);

    if (key === ELEMENT_INSERT_ATTR) {
      addInsert(node);
    }
  }
  for (const key in prev.attributes) {
    if (curr.attributes[key] == null) {
      node.removeAttribute(key);

      // problematic if explicit style attr is present. I can live with this
      // bug 🤷‍♂️
      if (key === ELEMENT_INSERT_ATTR) {
        node.removeAttribute("style");
      }
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
        createNativeNode(
          curr[i],
          options.domFactory,
          options.resolveUrl,
          null,
          options.showSlotPlaceholders
        )
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
