import {
  DynamicAttributeValuePart,
  IntermAttribute,
  IntermAttributeValuePart,
  IntermAttributeValuePartKind,
  IntermBaseNode,
  IntermChildNode,
  IntermComponent,
  IntermediatModule,
  IntermElement,
  IntermFragment,
  IntermNodeKind,
  IntermText,
  StaticAttributeValuePart
} from "paperclip-compiler-interm";
import {
  IntermScriptExpressionKind,
  IntermScriptExpression
} from "paperclip-compiler-interm";

export const compile = (interm: IntermediatModule) => {
  const buffer = [];

  buffer.push(...interm.components.map(compileComponent));

  return buffer.join("");
};

const compileComponent = (component: IntermComponent) => {
  const buffer = [`import React from "react";`];

  if (component.exported) {
    buffer.push("export ");
  }

  buffer.push(`function ${component.as}(props) {`);
  buffer.push("return ", compileElement(component));
  buffer.push("}");

  return buffer.join("");
};

const compileElement = (element: IntermElement | IntermComponent) => {
  const children = compileChildren(element.children);
  const attributes = compileAttributesInner(element);
  return `React.createElement("${element.tagName}", ${attributes}, ${children})`;
};

const compileAttributesInner = (element: IntermElement | IntermComponent) => {
  const atts = {
    class: [`"${element.scopeClassNames.join(" ")}"`]
  };

  for (const attribute of element.attributes) {
    if (!atts[attribute.name]) {
      atts[attribute.name] = [];
    }

    for (const variant of attribute.variants) {
      let value = variant.parts.map(compileAttributeValue).join(" ");
      if (variant.variantName) {
        value = `(${variant.variantName} ? ${value} : "")`;
      }
      atts[attribute.name].push(value);
    }
  }

  const inner = [];

  for (const name in atts) {
    inner.push(`"${name}":"" + ${atts[name].join(" + ")}`);
  }

  return `{${inner.join(", ")}}`;
};

const compileAttributeValue = (part: IntermAttributeValuePart) => {
  console.log(part);
  switch (part.kind) {
    case IntermAttributeValuePartKind.Dynamic:
      return compileDynamicAttributePart(part);
    case IntermAttributeValuePartKind.Static:
      return compileStaticAttributePart(part);
  }
};

const compileDynamicAttributePart = (part: DynamicAttributeValuePart) => {
  return compileScript(part.script);
};

const compileScript = (script: IntermScriptExpression) => {
  switch (script.kind) {
    case IntermScriptExpressionKind.String:
      return `"${script.value}"`;
    case IntermScriptExpressionKind.Reference:
      return script.name;
    case IntermScriptExpressionKind.Number:
      return script.value;
    case IntermScriptExpressionKind.Not:
      return `!${compileScript(script.expression)}`;
    case IntermScriptExpressionKind.Group:
      return `(${script.inner})`;
    case IntermScriptExpressionKind.Element:
      return compileElement(script.element);
    case IntermScriptExpressionKind.Conjunction:
      return `${compileScript(script.left)}${script.operator}${compileScript(
        script.right
      )}`;
    case IntermScriptExpressionKind.Boolean:
      return script.value;
  }
};

const compileStaticAttributePart = (part: StaticAttributeValuePart) => {
  return `"${part.value}"`;
};

const compileFragment = (element: IntermFragment) => {
  const children = compileChildren(element.children);
  return `React.createFragment(${children})`;
};

const compileText = (text: IntermText) => {
  return `"${text.value}"`;
};

const compileChildren = (children: IntermChildNode[]) => {
  return (
    "[" +
    children
      .map(child => {
        switch (child.kind) {
          case IntermNodeKind.Element: {
            return compileElement(child);
          }
          case IntermNodeKind.Fragment: {
            return compileFragment(child);
          }
          case IntermNodeKind.Text: {
            return compileText(child);
          }
        }
      })
      .join(",") +
    "]"
  );
};
