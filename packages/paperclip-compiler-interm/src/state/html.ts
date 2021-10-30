import { StringRange } from "paperclip-utils";
import { IntermScriptExpression } from "./script";

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
  attributes: IntermAttribute[];
  namespace?: string;
  children: BaseNode<any>[];
  scopeClassNames: string[];
} & BaseNode<TKind>;

export type IntermComponent = {
  as: string; // as attribute
  namespace?: string; // namespace from import
  exported: boolean;
} & BaseElement<IntermNodeKind.Component>;

export enum IntermAttributeValuePartKind {
  Static = "Static",
  Dynamic = "Dynamic"
}

type BaseAttributeValuePart<TKind extends IntermAttributeValuePartKind> = {
  kind: TKind;
  range: StringRange;
};

export type DynamicAttributeValuePart = {
  script: IntermScriptExpression;
} & BaseAttributeValuePart<IntermAttributeValuePartKind.Dynamic>;

export type StaticAttributeValuePart = {
  value: string;
} & BaseAttributeValuePart<IntermAttributeValuePartKind.Static>;

export type IntermAttributeValuePart =
  | DynamicAttributeValuePart
  | StaticAttributeValuePart;

export type IntermAttributeValue = {
  range: StringRange;

  // className:a="b"
  variantName?: string;

  // className:a="{aClass?}"
  parts: IntermAttributeValuePart[];
};

export type IntermAttribute = {
  name: string;
  // value parts - literal or dynamic. Covers className="a {className?}" and such
  variants: IntermAttributeValue[];
};

export type IntermElement = BaseElement<IntermNodeKind.Element>;

export type IntermText = {
  value: string;
} & BaseNode<IntermNodeKind.Text>;

export type IntermSlotNode = {
  script: IntermScriptExpression;
} & BaseNode<IntermNodeKind.Slot>;

export type IntermFragment = {
  children: IntermChildNode[];
} & BaseNode<IntermNodeKind.Fragment>;

export type IntermChildNode =
  | IntermElement
  | IntermText
  | IntermFragment
  | IntermSlotNode;
