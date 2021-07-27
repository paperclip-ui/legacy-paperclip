import { CSSExports, PCExports } from "./exports";
import { DependencyContent } from "./graph";
import { VirtJsObject } from "./js-virt";
import { memoize } from "./memo";
import { Mutation } from "./virt-mtuation";

export enum VirtualNodeKind {
  Element = "Element",
  Text = "Text",
  Fragment = "Fragment",
  StyleElement = "StyleElement"
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
};

export enum EvaluatedDataKind {
  PC = "PC",
  CSS = "CSS"
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
} & BaseEvaluatedData<EvaluatedDataKind.PC>;

export type EvaluatedCSSData = {
  sheet: any;

  // TODO - change to declarations, or something to imply declarations in the file. Definitions maybe?
  exports: CSSExports;
} & BaseEvaluatedData<EvaluatedDataKind.CSS>;

export type EvaluatedData = EvaluatedPCData | EvaluatedCSSData;

export enum DiffedDataKind {
  CSS = "CSS",
  PC = "PC"
}

export type BaseDiffedData<TKind = DiffedDataKind> = {
  kind: TKind;
};

export type DiffedCSSData = BaseDiffedData<DiffedDataKind.CSS>;

export type DiffedPCData = {
  allImportedSheetUris: string[];
  dependencies: Record<string, string>;
  // TODO - needs to be sheetMutations
  sheetMutations: any[];
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
  annotations?: VirtJsObject;
  tagName: string;
  sourceInfo?: VirtualElementSourceInfo;
  attributes: {
    [identifier: string]: string | null;
  };
  children: VirtualNode[];
} & VirtualBaseNode<VirtualNodeKind.Element>;

export type VirtualText = {
  annotations?: VirtJsObject;
  value: string;
} & VirtualBaseNode<VirtualNodeKind.Text>;

export type VirtualFragment = {
  children: VirtualNode[];
} & VirtualBaseNode<VirtualNodeKind.Fragment>;

export type VirtualNode =
  | VirtualElement
  | VirtualText
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
