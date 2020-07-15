import { PCExports } from "./exports";
import { Mutation } from "./virt-mtuation";

export enum VirtualNodeKind {
  Element = "Element",
  Text = "Text",
  Fragment = "Fragment",
  StyleElement = "StyleElement"
}

export type EvaluateData = {
  allDependencies: string[];
  sheet: any;
  preview: VirtualNode;

  // TODO - change to declarations, or something to imply declarations in the file. Definitions maybe?
  exports: PCExports;
  imports: Record<string, PCExports>;
};

export type DiffedData = {
  allDependencies: string[];
  // TODO - needs to be sheetMutations
  sheet: any;
  mutations: Mutation[];
  exports: PCExports;
  imports: Record<string, PCExports>;
};

export type SheetInfo = {
  sheet: any;
  uri: string;
};

export type LoadedData = EvaluateData & {
  importedSheets: SheetInfo[];
};

type VirtualBaseNode<KKind extends VirtualNodeKind> = {
  kind: KKind;
};

export type VirtualStyleElement = {
  sheet: any;
} & VirtualBaseNode<VirtualNodeKind.StyleElement>;

export type VirtualElement = {
  tagName: string;
  attributes: {
    [identifier: string]: string | null;
  };
  children: VirtualNode[];
} & VirtualBaseNode<VirtualNodeKind.Element>;

export type VirtualText = {
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
