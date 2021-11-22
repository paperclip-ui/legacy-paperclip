import { StringRange } from "paperclip-utils";
import { IntermScriptExpression } from "./script";

export enum IntermNodeKind {
  Element = "Element",
  Component = "Component",
  Text = "Text",
  Slot = "Slot",
  Fragment = "Fragment"
}

export type IntermBaseNode<TKind extends IntermNodeKind> = {
  kind: TKind;
  range: StringRange;
};

type BaseElement<TKind extends IntermNodeKind> = {
  tagName: string;
  attributes: IntermAttribute[];
  namespace?: string;
  scopeClassNames: string[];
} & IntermBaseNode<TKind>;

export type IntermComponent = {
  as: string; // as attribute
  namespace?: string; // namespace from import
  exported: boolean;
  children: IntermChildNode[];
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

export type IntermElement = {
  children: IntermChildNode[];
} & BaseElement<IntermNodeKind.Element>;

export type IntermText = {
  value: string;
} & IntermBaseNode<IntermNodeKind.Text>;

export type IntermSlotNode = {
  script: IntermScriptExpression;
} & IntermBaseNode<IntermNodeKind.Slot>;

export type IntermFragment = {
  children: IntermChildNode[];
} & IntermBaseNode<IntermNodeKind.Fragment>;

export type IntermChildNode =
  | IntermElement
  | IntermText
  | IntermFragment
  | IntermSlotNode;
