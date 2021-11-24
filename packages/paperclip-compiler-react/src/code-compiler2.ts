import {
  DynamicAttributeValuePart,
  IntermAttributeValuePart,
  IntermAttributeValuePartKind,
  IntermNode,
  IntermComponent,
  IntermediatModule,
  IntermElement,
  IntermNodeKind,
  IntermSlotNode,
  IntermText,
  StaticAttributeValuePart,
  IntermImport,
  IntermConjunctionOperator
} from "paperclip-compiler-interm";
import { camelCase, omit } from "lodash";
import {
  IntermScriptExpressionKind,
  IntermScriptExpression
} from "paperclip-compiler-interm";
import { getElementInstanceName } from "./utils";

const CAST_STYLE_UTIL = `
  const castStyle = (value) => {
    const tov = typeof value;
    if (tov === "object" || tov !== "string" || !value) return value;
    return value.trim().split(";").reduce((obj, keyValue) => {
      const [key, value] = keyValue.split(":");
      if (!value || value === "undefined") return obj;
      const trimmedValue = value.trim();
      if (trimmedValue === "undefined" || !trimmedValue) return obj;
      obj[key.trim()] = trimmedValue;
      return obj;
    }, {});
  };
`;

export const compile = (interm: IntermediatModule) => {
  const buffer = [`import React from "react";`];
  buffer.push(...interm.imports.map(translateImport(interm)));
  buffer.push(CAST_STYLE_UTIL);
  buffer.push(...interm.components.map(compileComponent(interm)));

  return buffer.join("");
};

const translateImport = (interm: IntermediatModule) => (imp: IntermImport) => {
  if (!imp.namespace) {
    return "";
  }

  const buffer = [`import `];

  buffer.push(`_${camelCase(imp.publicScopeId)}`);

  if (imp.usedTagNames.length) {
    const parts = [];

    for (const tagName of imp.usedTagNames) {
      parts.push(
        tagName +
          " as " +
          getElementInstanceName(imp.namespace, tagName, interm)
      );
    }

    buffer.push(`, {`, parts.join(","), `}`);
  }

  buffer.push(` from "${imp.filePath}"`);

  return buffer.join("");
};

const compileComponent = (module: IntermediatModule) => (
  component: IntermComponent
) => {
  const buffer = [];

  if (component.exported) {
    buffer.push("export ");
  }

  buffer.push(`function ${component.as}(props) {`);
  buffer.push("return ", compileElement(component, module));
  buffer.push("}");

  return buffer.join("");
};

const compileElement = (
  element: IntermElement | IntermComponent,
  module: IntermediatModule
) => {
  const children = compileChildren(element.children, module);
  let attributes = compileAttributeValues(element, module);

  let tagName = nativeOrInstanceTag(element, module);

  if (attributes.tagName && !element.isInstance) {
    tagName = `(${attributes.tagName}) || ${tagName}`;
    attributes = omit(attributes, "tagName");
  }

  return `React.createElement(${tagName}, ${json(attributes)}, ${children})`;
};

const nativeOrInstanceTag = (
  element: IntermElement | IntermComponent,
  module: IntermediatModule
) => {
  if (element.isInstance) {
    return getElementInstanceName(element.namespace, element.tagName, module);
  }

  return `"${element.tagName}"`;
};

const compileAttributeValues = (
  element: IntermElement | IntermComponent,
  module: IntermediatModule
): Record<string, string> => {
  const atts: Record<string, string> = {};
  atts.className = `"${element.scopeClassNames.join(" ")}"`;

  for (const name in element.attributes) {
    const attribute = element.attributes[name];

    let attrName = name;

    if (attrName === "class" && !element.isInstance) {
      attrName = "className";
    }

    const parts = [];
    for (const variant of attribute.variants) {
      let value = variant.parts
        .map(compileAttributeValue(attrName, module))
        .join(" + ");
      if (variant.variantName) {
        value = value
          ? `(${prop(variant.variantName)} ? ${value} : "")`
          : or(prop(variant.variantName), `""`);
      }
      parts.push(value);
    }

    let value = `${parts.join(`+ " " + `)}`;
    if (attrName === "style") {
      value = `castStyle(${value})`;
    }

    if (!value) {
      value = "true";
    }

    atts[attrName] = atts[attrName]
      ? atts[attrName] + ' + " " + ' + value
      : value;
  }

  return atts;
};

const json = (record: Record<string, string>) => {
  const inner = [];

  for (const name in record) {
    inner.push(`"${name}": ${record[name]}`);
  }

  return `{${inner.join(", ")}}`;
};

const prop = (name: string) => `props["${name}"]`;

const compileAttributeValue = (name: string, module: IntermediatModule) => (
  part: IntermAttributeValuePart
) => {
  switch (part.kind) {
    case IntermAttributeValuePartKind.Dynamic:
      return compileDynamicAttributePart(part, module);
    case IntermAttributeValuePartKind.Static:
      return compileStaticAttributePart(part);
    case IntermAttributeValuePartKind.Shorthand:
      return compileShorthandAttributePart(name);
  }
};

const compileDynamicAttributePart = (
  part: DynamicAttributeValuePart,
  module: IntermediatModule
) => {
  return or(compileScript(part.script, module), `""`);
};

const CONJ_MAP = {
  [IntermConjunctionOperator.And]: "&&",
  [IntermConjunctionOperator.Or]: "||"
};

const compileScript = (
  script: IntermScriptExpression,
  module: IntermediatModule
) => {
  switch (script.kind) {
    case IntermScriptExpressionKind.String:
      return `"${script.value}"`;
    case IntermScriptExpressionKind.Reference:
      return prop(script.name);
    case IntermScriptExpressionKind.Number:
      return script.value;
    case IntermScriptExpressionKind.Not:
      return `!${compileScript(script.expression, module)}`;
    case IntermScriptExpressionKind.Group:
      return `(${compileScript(script.inner, module)})`;
    case IntermScriptExpressionKind.Element:
      return compileElement(script.element, module);
    case IntermScriptExpressionKind.Conjunction:
      return `${compileScript(script.left, module)}${
        CONJ_MAP[script.operator]
      }${compileScript(script.right, module)}`;
    case IntermScriptExpressionKind.Boolean:
      return script.value;
  }
};

const or = (a, b) => `(${a} || ${b})`;

const compileStaticAttributePart = (part: StaticAttributeValuePart) => {
  return `"${part.value}"`;
};

const compileShorthandAttributePart = (name: string) => {
  return or(prop(name), `""`);
};

const compileText = (text: IntermText) => {
  return `"${text.value}"`;
};

const compileSlot = (slot: IntermSlotNode, module: IntermediatModule) => {
  return compileScript(slot.script, module);
};

const compileChildren = (children: IntermNode[], module: IntermediatModule) => {
  return (
    "[" +
    children
      .map(child => {
        switch (child.kind) {
          case IntermNodeKind.Element: {
            return compileElement(child, module);
          }
          case IntermNodeKind.Text: {
            return compileText(child);
          }
          case IntermNodeKind.Slot: {
            return compileSlot(child, module);
          }
        }
      })
      .join(",") +
    "]"
  );
};
