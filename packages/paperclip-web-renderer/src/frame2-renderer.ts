import {
  LoadedData,
  LoadedPCData,
  Node,
  NodeKind,
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
const BODY_INDEX = 2;

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
  const stage = options.domFactory.createElement("div");
  stage.appendChild(importedStyles.cloneNode(true));
  stage.appendChild(documentStyles.cloneNode(true));
  stage.appendChild(
    createNativeNode(node, options.domFactory, options.resolveUrl, null)
  );
  return stage;
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
  frames = patchHTML(frames, newData, previousData, options);

  return frames;
};
const patchHTML = (
  frames: HTMLElement[],
  previousData: LoadedPCData,
  newData: LoadedPCData,
  options: RenderFrameOptions
) => {
  const prevVirtFrames = getFrames(previousData.preview);
  const newVirtFrames = getFrames(newData.preview);
  const newFrames: HTMLElement[] = [];
  const low = Math.min(prevVirtFrames.length, newVirtFrames.length);

  for (let i = low; i--; ) {
    patchNode(
      frames[i].childNodes[0] as any,
      prevVirtFrames[i],
      newVirtFrames[i],
      options
    );
    newFrames.unshift(frames[i]);
  }

  if (prevVirtFrames.length > newVirtFrames.length) {
  }

  return newFrames;
};

const patchNode = (
  node: HTMLElement,
  prevVirtNode: VirtualNode,
  currVirtNode: VirtualNode,
  options: RenderFrameOptions
) => {
  if (prevVirtNode === currVirtNode) {
    return node;
  }

  if (prevVirtNode.kind !== currVirtNode.kind) {
    const repl = createNativeNode(
      currVirtNode,
      options.domFactory,
      options.resolveUrl,
      node.namespaceURI
    );
    node.parentElement.insertBefore(node, repl);
    node.parentElement.removeChild(node);
  }
  console.log("PATCH");

  return node;
};

const getFrames = (node: VirtualNode) =>
  node.kind === VirtualNodeKind.Fragment ? node.children : [node];
