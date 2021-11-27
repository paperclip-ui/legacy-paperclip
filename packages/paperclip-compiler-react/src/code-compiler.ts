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
  ShorthandAttributeValuePart,
  IntermAttribute,
  IntermAttributeValue
} from "paperclip-compiler-interm";
import { camelCase, omit } from "lodash";
import {
  IntermScriptExpressionKind,
  IntermScriptExpression
} from "paperclip-compiler-interm";
import {
  arrayJoin,
  createTranslateContext,
  getElementInstanceName,
  startBlock,
  endBlock,
  addBuffer,
  wrapSourceNode,
  writeSourceNode,
  writeJoin
} from "./utils";
import { Html5Entities } from "html-entities";
import { Context } from "./utils";

const entities = new Html5Entities();

const CAST_STYLE_UTIL = `
function castStyle(value) {
  var tov = typeof value;
  if (tov === "object" || tov !== "string" || !value) return value;
  return value.trim().split(";").reduce(function (obj, keyValue) {
    var kvp = keyValue.split(":");
    var key = kvp[0];
    var value = kvp[1];
    if (!value || value === "undefined") return obj;
    var trimmedValue = value.trim();
    if (trimmedValue === "undefined" || !trimmedValue) return obj;
    obj[key.trim()] = trimmedValue;
    return obj;
  }, {});
}
`.trim();

export const compile = (module: IntermediatModule, filePath: string) => {
  let context: Context = createTranslateContext(module, filePath);
  const initial = context;

  context = addBuffer([`import React from "react";\n\n`], context);

  context = translateImports(context);
  context = addBuffer([CAST_STYLE_UTIL, "\n\n"], context);
  context = compileComponents(context);

  return wrapSourceNode(
    { line: 1, column: 1, pos: 1 },
    initial,
    context
  ).buffer.join("");
};

const translateImports = (context: Context) => {
  return context.module.imports.reduce((context, imp) => {
    if (!imp.namespace) {
      return context;
    }

    context = addBuffer(
      [`import `, `_${camelCase(imp.publicScopeId)}`],
      context
    );

    if (imp.usedTagNames.length) {
      const parts = [];

      for (const tagName of imp.usedTagNames) {
        parts.push(
          tagName +
            " as " +
            getElementInstanceName(imp.namespace, tagName, context)
        );
      }

      context = addBuffer([`, {`, arrayJoin(parts, ","), `}`], context);
    }

    context = addBuffer([` from "${imp.filePath}";`, "\n"], context);

    return context;
  }, context);
};

const compileComponents = (context: Context) => {
  return context.module.components.reduce((context, component) => {
    return compileComponent(component, context);
  }, context);
};

const compileComponent = (
  component: IntermComponent,
  context: Context
): Context =>
  writeSourceNode(component.range.start, context, context => {
    if (component.exported) {
      context = addBuffer(["export "], context);
    }

    context = addBuffer(
      [
        `function ${component.as}(props) {`,
        "\n",
        startBlock,
        compileElement(component),
        endBlock,
        "\n",
        "}\n"
      ],
      context
    );
    return context;
  });

const compileElement = (element: IntermElement | IntermComponent) => (
  contet: Context
) => {
  return writeSourceNode(element.range.start, context, context => {
    context = addBuffer([`React.createElement(`], context);

    let tagName;

    if (element.tagName === "fragment") {
      tagName = `React.Fragment`;
    } else {
      tagName = nativeOrInstanceTag(element, context);
    }

    if (element.attributes.tagName) {
      const tagNameStr = tagName;
      tagName = context =>
        addBuffer(["props.tagName || ", tagNameStr], context);
    }

    context = addBuffer(
      [
        tagName,
        ", ",
        compileAttributes(element),
        ", ",
        compileChildren(element.children),
        ")"
      ],
      context
    );

    return context;
  });
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

const compileAttributes = (element: IntermElement | IntermComponent) => (
  context: Context
) => {
  context = addBuffer([`{\n`], context);
  context = startBlock(context);
  context = addBuffer(
    [`className: "${element.scopeClassNames.join(" ")}"`],
    context
  );
  const className = element.attributes.className || element.attributes.class;

  context = writeJoin(
    Object.keys(omit(element.attributes, ["className", "class"])),
    context,
    ",\n",
    (key, context) => {
      context = addBuffer([JSON.stringify(key), ": "], context);
      return compileAttributeValue(
        key,
        element.attributes[key].variants,
        context
      );
    }
  );

  context = addBuffer(["\n"], context);

  context = endBlock(context);
  context = addBuffer([`}`], context);

  return context;
};

const compileAttributeValue = (
  attrName: string,
  variants: IntermAttributeValue[],
  context: Context
) => {
  context = writeJoin(variants, context, ` + " " + `, (variant, context) => {
    if (!variant.parts) {
      return addBuffer([`true\n`], context);
    }

    if (variant.variantName) {
      context = addBuffer(
        [
          "(",
          prop(variant.variantName),
          " ? ",
          compileVariantParts(attrName, variant.parts),
          ` : "")`
        ],
        context
      );
    } else {
      context = compileVariantParts(attrName, variant.parts)(context);
    }
    return context;
  });

  return context;
};

const compileVariantParts = (
  attrName: string,
  parts: IntermAttributeValuePart[]
) => (context: Context) => {
  if (attrName === "style") {
    context = addBuffer([`castStyle(`], context);
  }

  context = writeJoin(parts, context, " + ", (part, context) => {
    return compileAttributeValuePart(attrName, context, part);
  });

  if (attrName === "style") {
    context = addBuffer([`)`], context);
  }

  return context;
};

const prop = (name: string) => `props["${name}"]`;

const compileAttributeValuePart = (
  name: string,
  context: Context,
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
  return writeSourceNode(part.range?.start, context, context => {
    return addBuffer(
      ["(", compileScript(part.script), " || ", '""', ")"],
      context
    );
  });
};

const CONJ_MAP = {
  [IntermConjunctionOperator.And]: "&&",
  [IntermConjunctionOperator.Or]: "||"
};

const compileScript = (script: IntermScriptExpression) => (context: Context) =>
  writeSourceNode(script.range.start, context, context => {
    switch (script.kind) {
      case IntermScriptExpressionKind.String:
        return addBuffer([JSON.stringify(script.value)], context);
      case IntermScriptExpressionKind.Reference:
        return addBuffer([prop(script.name)], context);
      case IntermScriptExpressionKind.Number:
        return addBuffer([String(script.value)], context);
      case IntermScriptExpressionKind.Not:
        return addBuffer(["!", compileScript(script.expression)], context);
      case IntermScriptExpressionKind.Group: {
        return addBuffer(["(", compileScript(script.inner), ")"], context);
      }
      case IntermScriptExpressionKind.Element:
        return compileElement(script.element)(context);
      case IntermScriptExpressionKind.Conjunction: {
        return addBuffer(
          [
            compileScript(script.left),
            CONJ_MAP[script.operator],
            compileScript(script.right)
          ],
          context
        );
      }
      case IntermScriptExpressionKind.Boolean:
        return addBuffer([String(script.value)], context);
    }
  });

const or = (a, b) => [`(`, a, `|| `, b, `)`];

const compileStaticAttributePart = (
  part: StaticAttributeValuePart,
  context: Context
) =>
  writeSourceNode(part.range?.start, context, context => {
    return addBuffer([JSON.stringify(part.value)], context);
  });

const compileShorthandAttributePart = (
  name: string,
  part: ShorthandAttributeValuePart,
  context: Context
) => {
  return writeSourceNode(part.range?.start, context, context =>
    addBuffer([or(prop(name), `""`)], context)
  );
};

const compileText = (text: IntermText, context: Context) => {
  context = writeSourceNode(text.range.start, context, context =>
    addBuffer([JSON.stringify(entities.decode(text.value))], context)
  );
  context = addBuffer(["\n"], context);
  return context;
};

const compileSlot = (slot: IntermSlotNode, context: Context) => {
  return compileScript(slot.script)(context);
};

const compileChildren = (children: IntermNode[]) => (context: Context) => {
  if (children.length === 0) {
    return addBuffer([`null`], context);
  }

  context = addBuffer([`[\n`], context);
  context = startBlock(context);
  context = writeJoin(children, context, ", ", (child, context) => {
    switch (child.kind) {
      case IntermNodeKind.Element: {
        context = compileElement(child)(context);
        context = addBuffer(["\n"], context);
        return context;
      }
      case IntermNodeKind.Text: {
        return addBuffer(["\n"], compileText(child, context));
      }
      case IntermNodeKind.Slot: {
        return addBuffer(["\n"], compileSlot(child, context));
      }
    }
  });
  context = endBlock(context);
  context = addBuffer([`]`], context);

  return context;
};
