import { CSSExports } from "../css/exports";
import { PCExports } from "./exports";
import { DependencyContent } from "../core/graph";
import { VirtScriptObject } from "../script/virt";
import { memoize } from "../core/memo";
import { getNodeAncestors, getNodePath } from "./tree";
import { Mutation } from "./virt-mtuation";
import { CSSMutation } from "../css/virt-mutation";
import { flattenTreeNode } from "..";

export enum VirtualNodeKind {
  Element = "Element",
  Text = "Text",
  Slot = "Slot",
  Fragment = "Fragment",
  StyleElement = "StyleElement",
}

export type VirtNodeSource = {
  uri: string;
  path: number[];
};

export type FrameAnnotation = {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  title?: string;
  visible?: boolean;
};

export type NodeAnnotations = {
  frame?: FrameAnnotation;
  tags?: string[];
  visualRegresionTest?: boolean;
};

export enum EvaluatedDataKind {
  PC = "PC",
  CSS = "CSS",
}

type BaseEvaluatedData<TKind = EvaluatedDataKind> = {
  kind: TKind;
};

export type EvaluatedPCData = {
  allImportedSheetUris: string[];
  dependencies: Record<string, string>;
  sheet: any;
  preview: VirtualNode;

  // TODO - change to declarations, or something to imply declarations in the file. Definitions maybe?
  exports: PCExports;
  usedExprIds?: string[];
} & BaseEvaluatedData<EvaluatedDataKind.PC>;

export type EvaluatedCSSData = {
  sheet: any;

  // TODO - change to declarations, or something to imply declarations in the file. Definitions maybe?
  exports: CSSExports;
} & BaseEvaluatedData<EvaluatedDataKind.CSS>;

export type EvaluatedData = EvaluatedPCData | EvaluatedCSSData;

export enum DiffedDataKind {
  CSS = "CSS",
  PC = "PC",
}

export type BaseDiffedData<TKind = DiffedDataKind> = {
  kind: TKind;
};

export type DiffedCSSData = {
  exports: CSSExports;
  mutations: CSSMutation[];
} & BaseDiffedData<DiffedDataKind.CSS>;

export type DiffedPCData = {
  allImportedSheetUris: string[];
  dependencies: Record<string, string>;
  sheetMutations: CSSMutation[];
  mutations: Mutation[];
  exports: PCExports;
} & BaseDiffedData<DiffedDataKind.PC>;

export type DiffedData = DiffedCSSData | DiffedPCData;

export type SheetInfo = {
  sheet: any;
  index: number;
  uri: string;
};

export type LoadedPCData = {
  importedSheets: SheetInfo[];
} & EvaluatedPCData;

export type LoadedCSSData = EvaluatedCSSData;

export type LoadedData = LoadedPCData | LoadedCSSData;

type VirtualBaseNode<KKind extends VirtualNodeKind> = {
  sourceId: string;
  id: string;
  kind: KKind;
};

export type VirtualStyleElement = {
  sheet: any;
} & VirtualBaseNode<VirtualNodeKind.StyleElement>;

export type VirtualElementInstanceOfInfo = {
  componentName: string;
};

export type VirtualElementSourceInfo = {
  instanceOf?: VirtualElementInstanceOfInfo;
};

export type VirtualElement = {
  annotations?: VirtScriptObject;
  tagName: string;
  sourceInfo?: VirtualElementSourceInfo;
  attributes: {
    [identifier: string]: string | null;
  };
  children: VirtualNode[];
} & VirtualBaseNode<VirtualNodeKind.Element>;

export type VirtualText = {
  annotations?: VirtScriptObject;
  value: string;
} & VirtualBaseNode<VirtualNodeKind.Text>;

export type VirtualSlot = VirtualBaseNode<VirtualNodeKind.Slot>;

export type VirtualFragment = {
  children: VirtualNode[];
} & VirtualBaseNode<VirtualNodeKind.Fragment>;

export type VirtualNode =
  | VirtualElement
  | VirtualText
  | VirtualSlot
  | VirtualFragment
  | VirtualStyleElement;

export type VirtualFrame = VirtualElement | VirtualText;

export const getStyleExports = (data: LoadedData) =>
  data.kind === EvaluatedDataKind.PC ? data.exports.style : data.exports;

export const nodePathToAry = memoize((path: string) =>
  path.split(".").map(Number)
);
export const getElementLabel = (node: VirtualElement) =>
  node.attributes["data-pc-label"] ||
  node.sourceInfo?.instanceOf?.componentName;

export const isInstance = (node: VirtualNode) =>
  node.kind === VirtualNodeKind.Element && Boolean(node.sourceInfo?.instanceOf);

export const getInstanceAncestor = (node: VirtualNode, root: VirtualNode) =>
  getNodeAncestors(getNodePath(node, root), root).find(isInstance);

export const getVirtNodeIdMap = memoize(
  (node: VirtualNode): Record<string, VirtualNode> => {
    const children = flattenTreeNode(node) as VirtualNode[];
    const map = {};
    for (const child of children) {
      map[child.id] = child;
    }
    return map;
  }
);

export const getVirtNodeBySourceId = (node: VirtualNode, sourceId: string) => {
  const map = getVirtNodeIdMap(node);
  for (const virtId in map) {
    if (map[virtId].sourceId === sourceId) {
      return map[virtId];
    }
  }
  return null;
};

// export const createVirtNodeSource = (path: number[], uri: string): VirtNodeSource => ({
//   uri,
//   path
// });

// export const createVirtNodeSourceFromInstance = (instance: VirtualNode, rendered: Record<string, LoadedData>) => {
//   for (const uri in rendered) {
//     const data = rendered[uri];
//     if (data.kind === EvaluatedDataKind.PC && containsNode(instance, data.preview)) {
//       return createVirtNodeSource(getNodePath(instance, data.preview).split(".").map(Number), uri);
//     }
//   }
// };
