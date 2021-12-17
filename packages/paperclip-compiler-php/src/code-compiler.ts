import {
  InterimComponent,
  InterimModule,
  InterimAttributeValue,
  InterimAttribute,
  InterimNode,
  InterimElement,
  InterimNodeKind,
  InterimSlotNode,
  InterimScriptExpression,
  InterimScriptExpressionKind,
  InterimText,
  InterimAttributeValuePart,
  InterimAttributeValuePartKind,
  DynamicAttributeValuePart,
  ShorthandAttributeValuePart,
  StaticAttributeValuePart
} from "paperclip-interim";
import * as path from "path";
import * as URL from "url";
import { PaperclipConfig } from "paperclip-utils";
import {
  addBuffer,
  createTranslateContext,
  Context,
  startBlock,
  endBlock,
  writeJoin
} from "paperclip-compiler-utils";

export const compile = (
  module: InterimModule,
  fileUrl: string,
  config: PaperclipConfig,
  cwd: string
) => {
  let context = createTranslateContext(module, fileUrl, config);

  context = addBuffer([
    `<?php\n`,
    writeNamespace(cwd),
    writeImports,
    writeComponents,
    "?>"
  ])(context);

  return context.buffer.join("");
};

const writeNamespace = (cwd: string) => (context: Context) => {
  const srcDir = path.join(cwd, context.config.srcDir);
  return addBuffer([
    `namespace ${URL.fileURLToPath(context.filePath)
      .replace(srcDir + "/", "")
      .replace(/\//g, "\\")
      .replace(".pc", "")
      .replace(/-/g, "_")};`,
    "\n\n"
  ]);
};

const writeImports = (context: Context) => {
  return context;
};

const writeComponents = (context: Context) => {
  return writeJoin(context.module.components, "\n\n", writeComponent, true);
};

const writeComponent = (component: InterimComponent) =>
  addBuffer([
    `function ${component.as}($props, $children = "") {`,
    startBlock,
    "\n",
    `return "\n`,
    writeElement(component),
    `";\n`,
    endBlock,
    `}`
  ]);

const writeElement = (element: InterimElement | InterimComponent) => {
  if (element.tagName === "fragment") {
    return writeChildren(element);
  } else {
    return writeRegularElement(element);
  }
};

const writeRegularElement = (element: InterimElement | InterimComponent) =>
  addBuffer([
    `<`,
    element.tagName,
    writeAttributes(element),
    ">\n",
    startBlock,
    writeChildren(element),
    endBlock,
    "\n",
    "</" + element.tagName + ">\n"
  ]);

const writeChildren = (element: InterimElement | InterimComponent) => {
  return writeJoin(element.children, "", writeChild, true);
};
const writeChild = (child: InterimNode) => {
  if (child.kind === InterimNodeKind.Element) {
    return writeElement(child);
  } else if (child.kind === InterimNodeKind.Slot) {
    return writeSlot(child);
  } else if (child.kind === InterimNodeKind.Text) {
    return writeText(child);
  }
};

const writeSlot = (slot: InterimSlotNode) =>
  addBuffer([`{`, writeScript(slot.script), `}`]);

const writeText = (text: InterimText) => addBuffer([text.value]);

const writeScript = (script: InterimScriptExpression) => {
  switch (script.kind) {
    case InterimScriptExpressionKind.Boolean: {
      return addBuffer([script.value ? `TRUE` : `FALSE`]);
    }
    case InterimScriptExpressionKind.Conjunction: {
      return addBuffer([
        writeScript(script.left),
        script.operator,
        writeScript(script.right)
      ]);
    }
    case InterimScriptExpressionKind.Element: {
      return writeElement(script.element);
    }
    case InterimScriptExpressionKind.Group: {
      return addBuffer([`(`, writeScript(script.inner), `)`]);
    }
    case InterimScriptExpressionKind.Not: {
      return addBuffer([`!`, writeScript(script.expression)]);
    }
    case InterimScriptExpressionKind.Number: {
      return addBuffer([script.value]);
    }
    case InterimScriptExpressionKind.Reference: {
      return addBuffer([ref(script.name)]);
    }
    case InterimScriptExpressionKind.String: {
      return addBuffer([`"${script.value}"`]);
    }
  }
};

const ref = (name: string) =>
  name == "children" ? `$children` : `$props->${name}`;

const writeAttributes = (element: InterimElement | InterimComponent) => (
  context: Context
) => {
  context = addBuffer([" "])(context);
  for (const name in element.attributes) {
    const attr = element.attributes[name];
    context = writeAttribute(name, attr)(context);
  }

  return context;
};

const writeAttribute = (name: string, attr: InterimAttribute) =>
  addBuffer([
    `${name}={`,
    writeJoin(attr.variants, `. " " . `, writeAttributeVariant(name)),
    "}"
  ]);

const writeAttributeVariant = (attrName: string) => (
  variant: InterimAttributeValue
) => (context: Context) => {
  if (variant.variantName) {
    return addBuffer([
      `(`,
      ref(variant.variantName),
      ``,
      ` ? `,
      writeAttributeVariantInner(attrName)(variant),
      `: "")`
    ])(context);
  } else {
    return writeAttributeVariantInner(attrName)(variant)(context);
  }
};

const writeAttributeVariantInner = (attrName: string) => (
  variant: InterimAttributeValue
) => writeJoin(variant.parts, " . ", writeAttributeValuePart(attrName));

const writeAttributeValuePart = (name: string) => (
  part: InterimAttributeValuePart
) => {
  switch (part.kind) {
    case InterimAttributeValuePartKind.Dynamic:
      return writeDynamicAttributeValuePart(part);
    case InterimAttributeValuePartKind.Shorthand:
      return writeShorthandAttributeValuePart(name);
    case InterimAttributeValuePartKind.Static:
      return writeStaticAttributeValuePart(part);
  }
};

const writeDynamicAttributeValuePart = (part: DynamicAttributeValuePart) =>
  writeScript(part.script);
const writeShorthandAttributeValuePart = (name: string) =>
  addBuffer([ref(name)]);
const writeStaticAttributeValuePart = (part: StaticAttributeValuePart) =>
  addBuffer([`"`, part.value, `"`]);
