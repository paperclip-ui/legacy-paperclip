import { Node, getParts, Element } from "paperclip";
import {
  AttributeKind,
  AttributeValue,
  AttributeValueKind,
  DynamicStringAttributeValuePartKind,
  getAttributeStringValue,
  getStyleScopeId,
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
import { IntermediateCompilerOptions, ModuleContext } from "./options";

type Context = {
  filePath: string;
  options: IntermediateCompilerOptions;
};

export const translateComponents = (
  ast: Node,
  options: IntermediateCompilerOptions,
  filePath: string
) => {
  const components = getParts(ast);
  const context: Context = { filePath, options };

  return components.map(component => translateComponent(component, context));
};

const translateComponent = (
  component: Element,
  context: Context
): IntermComponent => {
  const as = getAttributeStringValue("as", component);

  return {
    tagName: component.tagName,
    as,
    exported: hasAttribute("export", component),
    range: component.range,
    kind: IntermNodeKind.Component,
    scopeClassNames: getScopeClassNames(component, context),
    attributes: translateAttributes(component, context),
    children: translateChildren(component.children, context)
  };
};

const translateChildren = (
  children: Node[],
  context: Context
): IntermChildNode[] =>
  children.map(child => translateChild(child, context)).filter(Boolean);

const translateChild = (
  node: Node,
  context: ModuleContext
): IntermChildNode => {
  switch (node.nodeKind) {
    case NodeKind.Text: {
      return translateText(node);
    }
    case NodeKind.Element: {
      return translateElement(node, context);
    }
    case NodeKind.Slot: {
      return translateSlotNode(node, context);
    }
  }
};

const getScopeClassNames = (element: Element, context: Context) => {
  const scopeIds = [
    `_${element.id}`,
    `_${getStyleScopeId(context.filePath)}`,
    `_pub-${getStyleScopeId(context.filePath)}`
  ];

  return scopeIds;
};

const translateText = (text: Text): IntermText => {
  return {
    value: text.value,
    kind: IntermNodeKind.Text,
    range: text.range
  };
};

const translateAttributes = (element: Element, context: Context) => {
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

export const translateElement = (
  element: Element,
  context: Context
): IntermElement => {
  return {
    kind: IntermNodeKind.Element,
    tagName: element.tagName,
    attributes: translateAttributes(element, context),
    scopeClassNames: getScopeClassNames(element, context),
    range: element.range,
    children: translateChildren(element.children, context)
  };
};

const translateSlotNode = (slot: Slot, context: Context): IntermSlotNode => {
  return {
    kind: IntermNodeKind.Slot,
    script: translateScript(slot.script, context),
    range: slot.range
  };
};
