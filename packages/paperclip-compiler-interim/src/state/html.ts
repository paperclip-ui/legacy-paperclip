import { Inference, ShapeInference } from "paperclip";
import { NodeKind, StringRange } from "paperclip-utils";
import { InterimScriptExpression } from "./script";

export enum InterimNodeKind {
  Element = "Element",
  Component = "Component",
  Text = "Text",
  Slot = "Slot"
}

export type InterimBaseNode<TKind extends InterimNodeKind> = {
  kind: TKind;
  range: StringRange;
};

type BaseElement<TKind extends InterimNodeKind> = {
  tagName: string;
  attributes: Record<string, InterimAttribute>;
  namespace?: string;
  isInstance: boolean;
  scopeClassNames: string[];
} & InterimBaseNode<TKind>;

export type InterimComponent = {
  as: string; // as attribute
  exported: boolean;
  children: InterimNode[];
  props: ShapeInference;
} & BaseElement<InterimNodeKind.Component>;

export enum InterimAttributeValuePartKind {
  Static = "Static",
  Dynamic = "Dynamic",
  Shorthand = "Shorthand"
}

type BaseAttributeValuePart<TKind extends InterimAttributeValuePartKind> = {
  kind: TKind;
  range: StringRange;
};

export type DynamicAttributeValuePart = {
  script: InterimScriptExpression;
} & BaseAttributeValuePart<InterimAttributeValuePartKind.Dynamic>;

export type ShorthandAttributeValuePart = {} & BaseAttributeValuePart<
  InterimAttributeValuePartKind.Shorthand
>;

export type StaticAttributeValuePart = {
  value: string;
} & BaseAttributeValuePart<InterimAttributeValuePartKind.Static>;

export type InterimAttributeValuePart =
  | DynamicAttributeValuePart
  | StaticAttributeValuePart
  | ShorthandAttributeValuePart;

export type InterimAttributeValue = {
  range?: StringRange;

  // className:a="b"
  variantName?: string;

  // className:a="{aClass?}"
  parts?: InterimAttributeValuePart[];
};

export type InterimAttribute = {
  // value parts - literal or dynamic. Covers className="a {className?}" and such
  variants: InterimAttributeValue[];
};

export type InterimElement = {
  children: InterimNode[];
  isInstance: boolean;
} & BaseElement<InterimNodeKind.Element>;

export type InterimText = {
  value: string;
} & InterimBaseNode<InterimNodeKind.Text>;

export type InterimSlotNode = {
  script: InterimScriptExpression;
} & InterimBaseNode<InterimNodeKind.Slot>;

export type InterimNode =
  | InterimElement
  | InterimText
  | InterimComponent
  | InterimSlotNode;

export const traverseInterimNode = (
  node: InterimNode,
  each: (descendent: InterimNode) => boolean
) => {
  if (each(node) === false) {
    return;
  }
  if (
    node.kind === InterimNodeKind.Component ||
    node.kind === InterimNodeKind.Element
  ) {
    node.children.forEach(child => {
      traverseInterimNode(child, each);
    });
  }
};
