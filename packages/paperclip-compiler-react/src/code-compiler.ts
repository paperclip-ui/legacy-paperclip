import {
  InterimNode,
  InterimText,
  InterimImport,
  InterimElement,
  InterimNodeKind,
  InterimSlotNode,
  InterimComponent,
  interimModule,
  StaticAttributeValuePart,
  InterimAttributeValuePart,
  InterimConjunctionOperator,
  DynamicAttributeValuePart,
  InterimAttributeValuePartKind,
  ShorthandAttributeValuePart,
  InterimAttribute,
  InterimAttributeValue
} from "paperclip-compiler-interim";
import { camelCase, omit } from "lodash";
import {
  InterimScriptExpressionKind,
  InterimScriptExpression
} from "paperclip-compiler-interim";
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

export const compile = (module: interimModule, filePath: string) =>
  writeSourceNode(
    { line: 1, column: 1, pos: 1 },
    addBuffer([
      `import React from "react";\n\n`,
      translateImports,
      CAST_STYLE_UTIL,
      compileComponents,
      "\n\n"
    ])
  )(createTranslateContext(module, filePath)).buffer.join("");

const translateImports = (context: Context) => {
  return context.module.imports.reduce((context, imp) => {
    if (!imp.namespace) {
      return context;
    }

    context = addBuffer([`import `, `_${camelCase(imp.publicScopeId)}`])(
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

      context = addBuffer([`, {`, arrayJoin(parts, ","), `}`])(context);
    }

    context = addBuffer([` from "${imp.filePath}";`, "\n"])(context);

    return context;
  }, context);
};

const compileComponents = (context: Context) =>
  writeJoin(context.module.components, context, "\n\n", compileComponent);

const compileComponent = (component: InterimComponent) =>
  writeSourceNode(
    component.range.start,
    addBuffer([
      component.exported && "export ",
      `function ${component.as}(props) {`,
      "\n",
      startBlock,
      "return ",
      compileElement(component),
      endBlock,
      "\n",
      "}\n"
    ])
  );

const compileElement = (element: InterimElement | InterimComponent) =>
  writeSourceNode(element.range.start, context => {
    context = addBuffer([`React.createElement(`])(context);

    let tagName;

    if (element.tagName === "fragment") {
      tagName = `React.Fragment`;
    } else {
      tagName = nativeOrInstanceTag(element, context);
    }

    if (element.attributes.tagName) {
      const tagNameStr = tagName;
      tagName = context =>
        addBuffer(["props.tagName || ", tagNameStr])(context);
    }

    return addBuffer([
      tagName,
      ", ",
      compileAttributes(element),
      ", ",
      compileChildren(element.children),
      ")"
    ])(context);
  });

const nativeOrInstanceTag = (
  element: InterimElement | InterimComponent,
  context: Context
) => {
  if (element.isInstance) {
    return getElementInstanceName(element.namespace, element.tagName, context);
  }

  return `"${element.tagName}"`;
};

const compileAttributes = (element: InterimElement | InterimComponent) => (
  context: Context
) => {
  context = addBuffer([
    "{\n",
    startBlock,
    `className: `,
    `"${element.scopeClassNames.join(" ")}",`
  ])(context);

  context = writeJoin(
    Object.keys(omit(element.attributes, ["className", "class"])),
    context,
    ",\n",
    key => context => {
      context = addBuffer([JSON.stringify(key), ": "])(context);
      return compileAttributeValue(
        key,
        element.attributes[key].variants,
        context
      );
    }
  );

  return addBuffer(["\n", endBlock, "}"])(context);
};

const compileAttributeValue = (
  attrName: string,
  variants: InterimAttributeValue[],
  context: Context
) => {
  context = writeJoin(variants, context, ` + " " + `, variant => context => {
    if (!variant.parts) {
      return addBuffer([`true\n`])(context);
    }

    if (variant.variantName) {
      context = addBuffer([
        "(",
        prop(variant.variantName),
        " ? ",
        compileVariantParts(attrName, variant.parts),
        ` : "")`
      ])(context);
    } else {
      context = compileVariantParts(attrName, variant.parts)(context);
    }
    return context;
  });

  return context;
};

const compileVariantParts = (
  attrName: string,
  parts: InterimAttributeValuePart[]
) => (context: Context) => {
  if (attrName === "style") {
    context = addBuffer([`castStyle(`])(context);
  }

  context = writeJoin(
    parts,
    context,
    " + ",
    compileAttributeValuePart(attrName)
  );

  if (attrName === "style") {
    context = addBuffer([`)`])(context);
  }

  return context;
};

const prop = (name: string) => `props["${name}"]`;

const compileAttributeValuePart = (name: string) => (
  part: InterimAttributeValuePart
) => {
  switch (part.kind) {
    case InterimAttributeValuePartKind.Dynamic:
      return compileDynamicAttributePart(part);
    case InterimAttributeValuePartKind.Static:
      return compileStaticAttributePart(part);
    case InterimAttributeValuePartKind.Shorthand:
      return compileShorthandAttributePart(name, part);
  }
};

const compileDynamicAttributePart = (part: DynamicAttributeValuePart) =>
  writeSourceNode(
    part.range?.start,
    addBuffer(["(", compileScript(part.script), " || ", '""', ")"])
  );

const CONJ_MAP = {
  [InterimConjunctionOperator.And]: "&&",
  [InterimConjunctionOperator.Or]: "||"
};

const compileScript = (script: InterimScriptExpression) =>
  writeSourceNode(script.range.start, scriptCompiler(script));

const scriptCompiler = (script: InterimScriptExpression) => {
  switch (script.kind) {
    case InterimScriptExpressionKind.String:
      return addBuffer([JSON.stringify(script.value)]);
    case InterimScriptExpressionKind.Reference:
      return addBuffer([prop(script.name)]);
    case InterimScriptExpressionKind.Number:
      return addBuffer([String(script.value)]);
    case InterimScriptExpressionKind.Not:
      return addBuffer(["!", compileScript(script.expression)]);
    case InterimScriptExpressionKind.Group: {
      return addBuffer(["(", compileScript(script.inner), ")"]);
    }
    case InterimScriptExpressionKind.Element:
      return compileElement(script.element);
    case InterimScriptExpressionKind.Conjunction: {
      return addBuffer([
        compileScript(script.left),
        CONJ_MAP[script.operator],
        compileScript(script.right)
      ]);
    }
    case InterimScriptExpressionKind.Boolean:
      return addBuffer([String(script.value)]);
  }
};

const or = (a, b) => [`(`, a, `|| `, b, `)`];

const compileStaticAttributePart = (part: StaticAttributeValuePart) =>
  writeSourceNode(part.range?.start, addBuffer([JSON.stringify(part.value)]));

const compileShorthandAttributePart = (
  name: string,
  part: ShorthandAttributeValuePart
) => writeSourceNode(part.range?.start, addBuffer([or(prop(name), `""`)]));

const compileText = (text: InterimText) =>
  addBuffer([
    writeSourceNode(
      text.range.start,
      addBuffer([JSON.stringify(entities.decode(text.value))])
    ),
    "\n"
  ]);

const compileSlot = (slot: InterimSlotNode) => (context: Context) => {
  return compileScript(slot.script)(context);
};

const compileChildren = (children: InterimNode[]) => (context: Context) => {
  if (children.length === 0) {
    return addBuffer([`null`])(context);
  }

  context = addBuffer([`[\n`])(context);
  context = startBlock(context);
  context = writeJoin(children, context, ", ", child => {
    switch (child.kind) {
      case InterimNodeKind.Element: {
        return addBuffer([compileElement(child), "\n"]);
      }
      case InterimNodeKind.Text: {
        return addBuffer([compileText(child), "\n"]);
      }
      case InterimNodeKind.Slot: {
        return addBuffer([compileSlot(child), "\n"]);
      }
    }
  });
  return addBuffer([endBlock, `]`])(context);
};
