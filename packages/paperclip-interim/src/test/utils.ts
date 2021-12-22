import {
  InterimAttribute,
  InterimAttributeValue,
  InterimAttributeValuePart,
  InterimAttributeValuePartKind,
  InterimComponent,
  InterimExpression,
  InterimModule,
  InterimNode,
  InterimNodeKind,
  InterimScriptExpressionKind
} from "..";

export const stringifyInterimModule = (module: InterimModule) => {
  const buffer = [
    `${module.imports
      .map(imp => `<import src=${imp.filePath} as=${imp.namespace}  />`)
      .join("")}<style>${module.css.sheetText
      .replace(/[\n\r\t]/g, " ")
      .replace(/\s+/g, " ")}</style>`
  ];

  buffer.push(...module.components.map(stringifyNode));

  return buffer.join(" ");
};

export const stringifyNode = (node: InterimExpression) => {
  switch (node.kind) {
    case InterimNodeKind.Element:
    case InterimNodeKind.Component: {
      const buffer = [`<`, node.tagName];
      for (const name in node.attributes) {
        buffer.push(` ${name}=${stringifyAttribute(node.attributes[name])}`);
      }
      buffer.push(">");
      buffer.push(...node.children.map(stringifyNode));
      buffer.push("</", node.tagName, ">");
      return buffer.join("");
    }
    case InterimNodeKind.Slot: {
      return stringifyNode(node.script);
    }
    case InterimScriptExpressionKind.Element: {
      return stringifyNode(node.element);
    }
    case InterimNodeKind.Text: {
      return `[TEXT]`;
    }
  }
};

const stringifyAttribute = (attr: InterimAttribute) => {
  return attr.variants.map(variant => {
    const buffer = [];
    if (variant.variantName) {
      buffer.push(variant.variantName, "?");
    }
    if (variant.parts) {
      buffer.push(...variant.parts.map(stringifyVariantPart));
    }

    return buffer.join("+");
  });
};

const stringifyVariantPart = (part: InterimAttributeValuePart) => {
  switch (part.kind) {
    case InterimAttributeValuePartKind.Dynamic: {
      return `[SCRIPT]`;
    }
    case InterimAttributeValuePartKind.Shorthand: {
      return `[SELF]`;
    }
    case InterimAttributeValuePartKind.Static: {
      return part.value;
    }
  }
};
