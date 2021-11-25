import {
  IntermNode,
  IntermText,
  IntermImport,
  IntermElement,
  IntermNodeKind,
  IntermSlotNode,
  IntermComponent,
  IntermediatModule,
  StaticAttributeValuePart,
  IntermAttributeValuePart,
  IntermConjunctionOperator,
  DynamicAttributeValuePart,
  IntermAttributeValuePartKind,
  ShorthandAttributeValuePart
} from "paperclip-compiler-interm";
import { camelCase, omit } from "lodash";
import {
  IntermScriptExpressionKind,
  IntermScriptExpression
} from "paperclip-compiler-interm";
import { arrayJoin, getElementInstanceName } from "./utils";
import { Html5Entities } from "html-entities";
import { SourceNode } from "source-map";
import { Context } from "./utils";

const entities = new Html5Entities();

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

export const compile = (module: IntermediatModule, filePath: string) => {
  const context: Context = {
    module,
    filePath,
    buffer: [],
    lineNumber: 0,
    isNewLine: true,
    indent: "  "
  };

  const buffer: Array<any> = [`import React from "react";`];
  buffer.push(...module.imports.map(translateImport(context)));
  buffer.push(CAST_STYLE_UTIL);
  buffer.push(...module.components.map(compileComponent(context)));
  return new SourceNode(1, 1, filePath, buffer).toStringWithSourceMap().code;
};

const translateImport = (context: Context) => (imp: IntermImport) => {
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
          getElementInstanceName(imp.namespace, tagName, context)
      );
    }

    buffer.push(`, {`, arrayJoin(parts, ","), `}`);
  }

  buffer.push(` from "${imp.filePath}"`);

  return buffer;
};

const compileComponent = (context: Context) => (component: IntermComponent) => {
  const buffer = [];

  if (component.exported) {
    buffer.push("export ");
  }

  buffer.push(`function ${component.as}(props) {`);
  buffer.push("return ", compileElement(component, context));
  buffer.push("}");

  return new SourceNode(
    component.range.start.line,
    component.range.start.column,
    context.filePath,
    buffer
  );
};

const compileElement = (
  element: IntermElement | IntermComponent,
  context: Context
) => {
  const children = compileChildren(element.children, context);
  let attributes = compileAttributeValues(element, context);

  let tagName;

  if (element.tagName === "fragment") {
    tagName = `React.Fragment`;
  } else {
    tagName = nativeOrInstanceTag(element, context);
  }

  if (attributes.tagName && !element.isInstance) {
    tagName = [`(`, attributes.tagName, `) || `, tagName];
    attributes = omit(attributes, "tagName");
  }

  return new SourceNode(
    element.range.start.line,
    element.range.start.column,
    context.filePath,
    [
      `React.createElement(`,
      tagName,
      `, `,
      json(attributes),
      `, `,
      children,
      `)`
    ]
  );
};

const nativeOrInstanceTag = (
  element: IntermElement | IntermComponent,
  context: Context
) => {
  if (element.isInstance) {
    return getElementInstanceName(element.namespace, element.tagName, context);
  }

  return `"${element.tagName}"`;
};

const compileAttributeValues = (
  element: IntermElement | IntermComponent,
  context: Context
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
      if (!variant.parts) {
        continue;
      }
      let value = arrayJoin(
        variant.parts.map(compileAttributeValue(attrName, context)),
        " + "
      );

      if (variant.variantName) {
        value = value
          ? [`(`, prop(variant.variantName), " ? ", value, `: "")`]
          : or(prop(variant.variantName), `""`);
      }

      if (variant.range) {
        parts.push(
          new SourceNode(
            variant.range.start.line,
            variant.range.start.column,
            context.filePath,
            value
          )
        );
      } else {
        parts.push(value);
      }
    }

    let value = parts.length ? arrayJoin(parts, `+ " " +`) : `true`;
    if (attrName === "style") {
      value = [`castStyle(`, value, `)`];
    }

    atts[attrName] = atts[attrName]
      ? [atts[attrName], ' + " " + ', value]
      : value;
  }

  return atts;
};

const json = (record: Record<string, any>) => {
  const inner = [];

  for (const name in record) {
    inner.push([`"`, name, `": `, record[name]]);
  }

  return [`{`, arrayJoin(inner, ", "), `}`];
};

const prop = (name: string) => `props["${name}"]`;

const compileAttributeValue = (name: string, context: Context) => (
  part: IntermAttributeValuePart
) => {
  switch (part.kind) {
    case IntermAttributeValuePartKind.Dynamic:
      return compileDynamicAttributePart(part, context);
    case IntermAttributeValuePartKind.Static:
      return compileStaticAttributePart(part, context);
    case IntermAttributeValuePartKind.Shorthand:
      return compileShorthandAttributePart(name, part, context);
  }
};

const compileDynamicAttributePart = (
  part: DynamicAttributeValuePart,
  context: Context
) => {
  return new SourceNode(
    part.range.start.line,
    part.range.start.column,
    context.filePath,
    or(compileScript(part.script, context), `""`)
  );
};

const CONJ_MAP = {
  [IntermConjunctionOperator.And]: "&&",
  [IntermConjunctionOperator.Or]: "||"
};

const compileScript = (script: IntermScriptExpression, context: Context) => {
  let buffer: any;

  switch (script.kind) {
    case IntermScriptExpressionKind.String:
      buffer = JSON.stringify(script.value);
      break;
    case IntermScriptExpressionKind.Reference:
      buffer = prop(script.name);
      break;
    case IntermScriptExpressionKind.Number:
      buffer = String(script.value);
      break;
    case IntermScriptExpressionKind.Not:
      buffer = ["!", compileScript(script.expression, context)];
      break;
    case IntermScriptExpressionKind.Group:
      buffer = ["(", compileScript(script.inner, context), ")"];
      break;
    case IntermScriptExpressionKind.Element:
      buffer = compileElement(script.element, context);
      break;
    case IntermScriptExpressionKind.Conjunction:
      buffer = [
        compileScript(script.left, context),
        CONJ_MAP[script.operator],
        compileScript(script.right, context)
      ];
      break;
    case IntermScriptExpressionKind.Boolean:
      buffer = String(script.value);
      break;
  }

  return new SourceNode(
    script.range.start.line,
    script.range.start.column,
    context.filePath,
    buffer
  );
};

const or = (a, b) => [`(`, a, `|| `, b, `)`];

const compileStaticAttributePart = (
  part: StaticAttributeValuePart,
  context: Context
) => {
  return new SourceNode(
    part.range.start.line,
    part.range.start.column,
    context.filePath,
    `"${part.value}"`
  );
};

const compileShorthandAttributePart = (
  name: string,
  part: ShorthandAttributeValuePart,
  context: Context
) => {
  return new SourceNode(
    part.range.start.line,
    part.range.start.column,
    context.filePath,
    or(prop(name), `""`)
  );
};

const compileText = (text: IntermText, context: Context) => {
  return new SourceNode(
    text.range.start.line,
    text.range.start.column,
    context.filePath,
    JSON.stringify(entities.decode(text.value))
  );
};

const compileSlot = (slot: IntermSlotNode, context: Context) => {
  return compileScript(slot.script, context);
};

const compileChildren = (children: IntermNode[], context: Context) => {
  if (children.length === 0) {
    return `null`;
  }
  return (
    "[" +
    arrayJoin(
      children.map(child => {
        switch (child.kind) {
          case IntermNodeKind.Element: {
            return compileElement(child, context);
          }
          case IntermNodeKind.Text: {
            return compileText(child, context);
          }
          case IntermNodeKind.Slot: {
            return compileSlot(child, context);
          }
        }
      }),
      ", "
    ) +
    "]"
  );
};
