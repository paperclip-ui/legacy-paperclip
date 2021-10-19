import { JsExpression, StringAttributeValue } from "paperclip";

export type CSSExports = {
  classNames: string[];
  keyframes: string[];
};

export type IntermediateCSS = {
  sheetText: string;
  exports: CSSExports;
};

export enum NodeKind {
  Element = "Element",
  Text = "Text",
  Slot = "Slot",
  Fragment = "Fragment"
}

type BaseNode<TKind extends NodeKind> = {
  kind: TKind;
};

export type Component<TKind extends NodeKind> = {
  name: string;
  id: string;
  exported: boolean;
  children: ChildNode[];
} & BaseNode<TKind>;

export enum AttributeValueKind {
  String = "String",
  Script = "Script"
}

type BaseAttributeValue<TKind extends AttributeValueKind> = {
  // for className:variant="value"
  variantPropertyName?: string;

  kind: TKind;
};

type ScriptAttributeValue = {
  script: JsExpression;
} & BaseAttributeValue<AttributeValueKind.Script>;

export type StringAttribteValue = {
  value: String;
} & BaseAttributeValue<AttributeValueKind.String>;

export type AttributeValue = ScriptAttributeValue | StringAttributeValue;

export type Attribute = {
  name: string;
  values: AttributeValue[];
};

export type Element = {
  tagName: string;
  attributes: Attribute[];
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
  css: IntermediateCSS;

  // assets (svg, jpg, etc) embedded in this doc.
  assets: Asset[];
};
