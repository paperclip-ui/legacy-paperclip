import { JsExpression, StringAttributeValue } from "paperclip";
import { StringRange } from "paperclip-utils";

export type CSSExports = {
  classNames: string[];
  keyframes: string[];
};

export type IntermCSS = {
  sheetText: string;
  exports: CSSExports;
};

export enum IntermNodeKind {
  Element = "Element",
  Component = "Component",
  Text = "Text",
  Slot = "Slot",
  Fragment = "Fragment"
}

type BaseNode<TKind extends IntermNodeKind> = {
  kind: TKind;
  range: StringRange;
};

type BaseElement<TKind extends IntermNodeKind> = {
  tagName: string;
  attributes: Attribute[];
  children: BaseNode<any>[];
} & BaseNode<TKind>;

export type IntermComponent = {
  as: string; // as attribute
  namespace?: string; // namespace from import
  exported: boolean;
} & BaseElement<IntermNodeKind.Component>;

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

export type IntermElement = BaseElement<IntermNodeKind.Element>;

export type IntermText = {
  value: string;
} & BaseNode<IntermNodeKind.Text>;

export type IntermSlotNode = {
  script: JsExpression;
} & BaseNode<IntermNodeKind.Slot>;

export type IntermFragment = {
  children: IntermChildNode[];
} & BaseNode<IntermNodeKind.Fragment>;

export type IntermChildNode =
  | IntermElement
  | IntermText
  | IntermFragment
  | IntermSlotNode;

export type IntermAsset = {
  // absolute file path to the asset
  filePath: string;

  // document
  documentName: string;
};

export type IntermediatModule = {
  // exported components
  components: IntermComponent[];

  // compiled CSS in this doc -- dev just needs to include generated text
  // wherever and load in the module
  css: IntermCSS;

  // assets (svg, jpg, etc) embedded in this doc.
  assets: IntermAsset[];
};
