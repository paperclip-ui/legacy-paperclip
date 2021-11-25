import { Inference, ShapeInference } from "paperclip";
import { NodeKind, StringRange } from "paperclip-utils";
import { IntermScriptExpression } from "./script";

export enum IntermNodeKind {
  Element = "Element",
  Component = "Component",
  Text = "Text",
  Slot = "Slot"
}

export type IntermBaseNode<TKind extends IntermNodeKind> = {
  kind: TKind;
  range: StringRange;
};

type BaseElement<TKind extends IntermNodeKind> = {
  tagName: string;
  attributes: Record<string, IntermAttribute>;
  namespace?: string;
  isInstance: boolean;
  scopeClassNames: string[];
} & IntermBaseNode<TKind>;

export type IntermComponent = {
  as: string; // as attribute
  exported: boolean;
  children: IntermNode[];
  props: ShapeInference;
} & BaseElement<IntermNodeKind.Component>;

export enum IntermAttributeValuePartKind {
  Static = "Static",
  Dynamic = "Dynamic",
  Shorthand = "Shorthand"
}

type BaseAttributeValuePart<TKind extends IntermAttributeValuePartKind> = {
  kind: TKind;
  range: StringRange;
};

export type DynamicAttributeValuePart = {
  script: IntermScriptExpression;
} & BaseAttributeValuePart<IntermAttributeValuePartKind.Dynamic>;

export type ShorthandAttributeValuePart = {} & BaseAttributeValuePart<
  IntermAttributeValuePartKind.Shorthand
>;

export type StaticAttributeValuePart = {
  value: string;
} & BaseAttributeValuePart<IntermAttributeValuePartKind.Static>;

export type IntermAttributeValuePart =
  | DynamicAttributeValuePart
  | StaticAttributeValuePart
  | ShorthandAttributeValuePart;

export type IntermAttributeValue = {
  range?: StringRange;

  // className:a="b"
  variantName?: string;

  // className:a="{aClass?}"
  parts?: IntermAttributeValuePart[];
};

export type IntermAttribute = {
  // value parts - literal or dynamic. Covers className="a {className?}" and such
  variants: IntermAttributeValue[];
};

export type IntermElement = {
  children: IntermNode[];
  isInstance: boolean;
} & BaseElement<IntermNodeKind.Element>;

export type IntermText = {
  value: string;
} & IntermBaseNode<IntermNodeKind.Text>;

export type IntermSlotNode = {
  script: IntermScriptExpression;
} & IntermBaseNode<IntermNodeKind.Slot>;

export type IntermNode =
  | IntermElement
  | IntermText
  | IntermComponent
  | IntermSlotNode;

export const traverseIntermNode = (
  node: IntermNode,
  each: (descendent: IntermNode) => boolean
) => {
  if (each(node) === false) {
    return;
  }
  if (
    node.kind === IntermNodeKind.Component ||
    node.kind === IntermNodeKind.Element
  ) {
    node.children.forEach(child => {
      traverseIntermNode(child, each);
    });
  }
};
