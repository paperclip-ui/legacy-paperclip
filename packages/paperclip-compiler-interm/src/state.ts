import { JsExpression } from "paperclip";

export type CSSExports = {
  classNames: string[];
  keyframes: string[];
};

export type CSS = {
  sheetText: string;
  exports: CSSExports;
};

export enum NodeKind {
  Element = "Element",
  Text = "Text",
  Slot = "Slot",
  Fragment = "Fragment"
}

export type BaseNode<TKind extends NodeKind> = {
  kind: TKind;
};

export type Component<TKind extends NodeKind> = {
  name: string;
  id: string;
  exported: boolean;
  children: ChildNode[];
} & BaseNode<TKind>;

export type Element = {
  tagName: string;
  children: ChildNode[];
} & BaseNode<NodeKind.Element>;

export type Text = {
  value: string;
} & BaseNode<NodeKind.Text>;

export type Slot = {
  script: JsExpression;
} & BaseNode<NodeKind.Slot>;

export type Fragment = {
  children: ChildNode[];
} & BaseNode<NodeKind.Fragment>;

export type ChildNode = Element | Text | Fragment;

export type Asset = {
  // absolute file path to the asset
  filePath: string;

  // document
  documentName: string;
};

export type IntermediatModule = {
  // exported components
  components: Component<any>[];

  // compiled CSS in this doc -- dev just needs to include generated text
  // wherever and load in the module
  css: CSS;

  // assets (svg, jpg, etc) embedded in this doc.
  assets: Asset[];
};
