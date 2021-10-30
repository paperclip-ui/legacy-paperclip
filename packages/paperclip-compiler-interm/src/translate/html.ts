import { Node, getParts, Element } from "paperclip";
import {
  AttributeKind,
  AttributeValue,
  AttributeValueKind,
  DynamicStringAttributeValuePartKind,
  getAttributeStringValue,
  hasAttribute,
  NodeKind,
  Reference,
  Slot,
  Text
} from "paperclip-utils";
import {
  IntermElement,
  IntermSlotNode,
  IntermComponent,
  IntermChildNode,
  IntermAttributeValue,
  IntermAttribute,
  IntermAttributeValuePart,
  IntermAttributeValuePartKind,
  IntermNodeKind,
  IntermText
} from "../state";
import { translateScript } from "./script";

// import {  } from "./script";

type IntermediateCompilerOptions = {};

export const translateComponents = (
  ast: Node,
  options: IntermediateCompilerOptions
) => {
  const components = getParts(ast);

  return components.map(translateComponent(options));
};

const translateComponent = (options: IntermediateCompilerOptions) => (
  component: Element
): IntermComponent => {
  const as = getAttributeStringValue("as", component);

  return {
    tagName: component.tagName,
    as,
    exported: hasAttribute("export", component),
    range: component.range,
    kind: IntermNodeKind.Component,
    attributes: translateAttributes(component),
    children: translateChildren(options)(component.children)
  };
};

const translateChildren = (options: IntermediateCompilerOptions) => (
  children: Node[]
): IntermChildNode[] => children.map(translateChild(options)).filter(Boolean);

const translateChild = (options: IntermediateCompilerOptions) => (
  node: Node
): IntermChildNode => {
  switch (node.nodeKind) {
    case NodeKind.Text: {
      return translateText(node);
    }
    case NodeKind.Element: {
      return translateElement(options)(node);
    }
    case NodeKind.Slot: {
      return translateSlotNode(options)(node);
    }
  }
};

const translateText = (text: Text): IntermText => {
  return {
    value: text.value,
    kind: IntermNodeKind.Text,
    range: text.range
  };
};

const translateAttributes = (element: Element) => {
  const groups: Record<string, IntermAttribute> = {};

  for (const attribute of element.attributes) {
    switch (attribute.attrKind) {
      case AttributeKind.KeyValueAttribute: {
        maybeAddAttributeValue(groups, attribute.name, {
          range: attribute.range,
          variantName: null,
          parts: getAttributeValueParts(attribute.value)
        });
        break;
      }
      case AttributeKind.PropertyBoundAttribute: {
        maybeAddAttributeValue(groups, attribute.name, {
          range: attribute.range,
          variantName: attribute.bindingName,
          parts: getAttributeValueParts(attribute.value)
        });
        break;
      }
      case AttributeKind.ShorthandAttribute: {
        maybeAddAttributeValue(
          groups,
          (attribute.reference as Reference).path[0].name,
          {
            range: attribute.range,
            variantName: null,
            parts: [
              {
                kind: IntermAttributeValuePartKind.Dynamic,
                script: null,
                range: attribute.reference.range
              }
            ]
          }
        );
        break;
      }
      default: {
        throw new Error(
          `Cannot handle attribute value kind ${attribute.attrKind}`
        );
      }
    }
  }

  return Object.values(groups);
};

const getAttributeValueParts = (
  value?: AttributeValue
): IntermAttributeValuePart[] => {
  const parts = [];
  if (!value) {
    return parts;
  }
  switch (value.attrValueKind) {
    case AttributeValueKind.DyanmicString: {
      return value.values.map(part => {
        switch (part.partKind) {
          case DynamicStringAttributeValuePartKind.ClassNamePierce: {
            throw new Error(`Not implemented yet`);
          }
          case DynamicStringAttributeValuePartKind.Literal: {
            return {
              kind: IntermAttributeValuePartKind.Static,
              value: part.value,
              range: part.range
            };
          }
          case DynamicStringAttributeValuePartKind.Slot: {
            return {
              kind: IntermAttributeValuePartKind.Dynamic,
              script: null,
              range: part.range
            };
          }
        }
      });
    }
    case AttributeValueKind.String: {
      return [
        {
          kind: IntermAttributeValuePartKind.Static,
          value: value.value,
          range: value.range
        }
      ];
    }
    case AttributeValueKind.Slot: {
      return [
        {
          kind: IntermAttributeValuePartKind.Dynamic,
          script: null,
          range: value.range
        }
      ];
    }
  }
};

const maybeAddAttributeValue = (
  groups: Record<string, IntermAttribute>,
  name: string,
  value: IntermAttributeValue
) => {
  // skip intermal props
  if (/^(export|component|as)$/.test(name)) {
    return;
  }

  if (!groups[name]) {
    groups[name] = { name, variants: [] };
  }

  const group = groups[name];

  // prohibit multiple attributes with the same variant name. E.g: `className="a" className="b"`. In this case, the last one wins.
  for (let i = group.variants.length; i--; ) {
    const variant = group.variants[i];
    if (variant.variantName === value.variantName) {
      group.variants.splice(i, 1);
      break;
    }
  }

  group.variants.push(value);
};

export const translateElement = (options: IntermediateCompilerOptions) => (
  element: Element
): IntermElement => {
  return {
    kind: IntermNodeKind.Element,
    tagName: element.tagName,
    attributes: translateAttributes(element),
    range: element.range,
    children: translateChildren(options)(element.children)
  };
};

const translateSlotNode = (options: IntermediateCompilerOptions) => (
  slot: Slot
): IntermSlotNode => {
  // console.log(JSON.stringify(slot, null, 2));
  return {
    kind: IntermNodeKind.Slot,
    script: translateScript(options)(slot.script),
    range: slot.range
  };
};
