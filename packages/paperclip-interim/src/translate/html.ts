import { Node, getParts, Element, infer, EngineDelegate } from "paperclip";
import {
  AttributeKind,
  AttributeValue,
  AttributeValueKind,
  DynamicStringAttributeValuePartKind,
  getAttributeStringValue,
  getPartIds,
  getStyleScopeId,
  hasAttribute,
  NodeKind,
  Reference,
  Slot,
  Text
} from "paperclip-utils";
import {
  InterimElement,
  InterimSlotNode,
  InterimComponent,
  InterimNode,
  InterimAttributeValue,
  InterimAttribute,
  InterimAttributeValuePart,
  InterimAttributeValuePartKind,
  InterimNodeKind,
  InterimText,
  InterimImport
} from "../state";
import { translateScript } from "./script";
import { InterimCompilerOptions, ModuleContext } from "./options";
import { maybeEmbed } from "./utils";
import { InterimAsset } from "../state/assets";

export const translateComponents = (
  ast: Node,
  filePath: string,
  engine: EngineDelegate,
  imports: InterimImport[],
  assets: InterimAsset[]
) => {
  const components = getParts(ast);
  const context: ModuleContext = {
    filePath,
    imports,
    assets,
    engine,
    componentNames: getPartIds(ast),
    scopeIds: [
      ...getScopes(filePath),
      ...imports.filter(imp => imp.injectedStyles).map(imp => imp.publicScopeId)
    ]
  };

  return components.map(component => translateComponent(component, context));
};

const getTagNameParts = (tagName: string) => {
  const parts = tagName.split(".");
  if (parts.length === 1) {
    return { tagName: parts[0] };
  }
  return { innerTagName: parts[1], tagName: parts[0] };
};

const translateComponent = (
  component: Element,
  context: ModuleContext
): InterimComponent => {
  const as = getAttributeStringValue("as", component);
  const { tagName, innerTagName } = getTagNameParts(component.tagName);

  return {
    id: component.id,
    tagName,
    as,
    innerTagName,
    schema: infer(component),
    isInstance: !isNativeElement(component.tagName, context),
    scopeClassNames: getScopeClassNames(component, context),
    exported: hasAttribute("export", component),
    range: component.range,
    kind: InterimNodeKind.Component,
    attributes: translateAttributes(component, context),
    children: translateChildren(component.children, context)
  };
};

const translateChildren = (
  children: Node[],
  context: ModuleContext
): InterimNode[] =>
  children.map(child => translateChild(child, context)).filter(Boolean);

const translateChild = (node: Node, context: ModuleContext): InterimNode => {
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

const getScopeClassNames = (element: Element, context: ModuleContext) => {
  const scopeIds = [`_${element.id}`];

  if (
    isNativeElement(element.tagName, context) ||
    isImportedInstance(element.tagName, context)
  ) {
    scopeIds.push(...context.scopeIds);
  }

  return scopeIds;
};

const translateText = (text: Text): InterimText => {
  return {
    value: text.value,
    kind: InterimNodeKind.Text,
    range: text.range
  };
};

const translateAttributes = (element: Element, context: ModuleContext) => {
  const groups: Record<string, InterimAttribute> = {};

  for (const attribute of element.attributes) {
    switch (attribute.attrKind) {
      case AttributeKind.KeyValueAttribute: {
        maybeAddAttributeValue(
          groups,
          attribute.name,
          {
            range: attribute.range,
            variantName: null,
            parts: getAttributeValueParts(
              attribute.value,
              attribute.name,
              element.tagName,
              context
            )
          },
          element.tagName,
          context
        );
        break;
      }
      case AttributeKind.PropertyBoundAttribute: {
        maybeAddAttributeValue(
          groups,
          attribute.name,
          {
            range: attribute.range,
            variantName: attribute.bindingName,
            parts: getAttributeValueParts(
              attribute.value,
              attribute.name,
              element.tagName,
              context
            )
          },
          element.tagName,
          context
        );
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
                kind: InterimAttributeValuePartKind.Shorthand,
                range: attribute.reference.range
              }
            ]
          },
          element.tagName,
          context
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

  return groups;
};

const getAttributeValueParts = (
  value: AttributeValue,
  attrName: string,
  tagName: string,
  context: ModuleContext
): InterimAttributeValuePart[] => {
  if (!value) {
    return null;
  }
  switch (value.attrValueKind) {
    case AttributeValueKind.DyanmicString: {
      return value.values.map(part => {
        switch (part.partKind) {
          case DynamicStringAttributeValuePartKind.ClassNamePierce: {
            return {
              kind: InterimAttributeValuePartKind.Static,
              value: pierceClassName(part.className, context),
              range: part.range
            };
          }
          case DynamicStringAttributeValuePartKind.Literal: {
            return {
              kind: InterimAttributeValuePartKind.Static,
              value: translateValuePart(part.value, attrName, tagName, context),
              range: part.range
            };
          }
          case DynamicStringAttributeValuePartKind.Slot: {
            return {
              kind: InterimAttributeValuePartKind.Dynamic,
              script: translateScript(part, context),
              range: part.range
            };
          }
        }
      });
    }
    case AttributeValueKind.String: {
      return [
        {
          kind: InterimAttributeValuePartKind.Static,
          value: translateValuePart(value.value, attrName, tagName, context),
          range: value.range
        }
      ];
    }
    case AttributeValueKind.Slot: {
      return [
        {
          kind: InterimAttributeValuePartKind.Dynamic,
          script: translateScript(value.script, context),
          range: value.range
        }
      ];
    }
  }
};

const getScopes = (filePath: string) => {
  return [`_${getStyleScopeId(filePath)}`, `_pub-${getStyleScopeId(filePath)}`];
};

const translateValuePart = (
  part: string,
  attrName: string,
  elementName: string,
  context: ModuleContext
) => {
  if (!isNativeElement(elementName, context)) {
    return part;
  }

  if (attrName === "class") {
    return part
      .split(" ")
      .map(slice => {
        if (!slice) {
          return "";
        }
        return addScopeIds(slice, context.scopeIds);
      })
      .join(" ");
  }

  if (attrName === "src") {
    const asset = context.assets.find(asset => asset.originalPath === part);
    if (asset && asset.moduleContent) {
      return asset.moduleContent;
    }
  }

  return part;
};

const pierceClassName = (className: string, context: ModuleContext) => {
  let scopeIds: string[] = context.scopeIds;

  const parts = className.split(".");

  if (parts.length === 2) {
    const imp = context.imports.find(imp => imp.namespace === parts[0]);
    if (imp) {
      scopeIds = getScopes(imp.filePath);
    }
  }

  return addScopeIds(parts[parts.length - 1], scopeIds);
};

const addScopeIds = (className: string, scopeIds: string[]) => {
  return (
    scopeIds.map(scopeId => `${scopeId}_${className}`).join(" ") +
    ` ${className}`
  );
};

const isNativeElement = (tagName: string, context: ModuleContext) => {
  return (
    !isImportedInstance(tagName, context) &&
    !context.componentNames.includes(tagName)
  );
};

const isImportedInstance = (tagName: string, context: ModuleContext) => {
  return (
    tagName.includes(".") ||
    context.imports.find(imp => imp.namespace === tagName)
  );
};

const maybeAddAttributeValue = (
  groups: Record<string, InterimAttribute>,
  name: string,
  value: InterimAttributeValue,
  tagName: string,
  context: ModuleContext
) => {
  // skip intermal props
  if (/^(export|component|as)$/.test(name)) {
    return;
  }

  const isNative = isNativeElement(tagName, context);

  if (!groups[name]) {
    groups[name] = { variants: [] };
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
  context: ModuleContext
): InterimElement => {
  const { tagName, innerTagName } = getTagNameParts(element.tagName);
  return {
    id: element.id,
    kind: InterimNodeKind.Element,
    innerTagName,
    tagName: tagName,
    isInstance: !isNativeElement(element.tagName, context),
    scopeClassNames: getScopeClassNames(element, context),
    attributes: translateAttributes(element, context),
    range: element.range,
    children: translateChildren(element.children, context)
  };
};

const translateSlotNode = (
  slot: Slot,
  context: ModuleContext
): InterimSlotNode => {
  return {
    kind: InterimNodeKind.Slot,
    script: translateScript(slot.script, context),
    range: slot.range
  };
};
