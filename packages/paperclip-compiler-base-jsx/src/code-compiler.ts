import {
  InterimNode,
  InterimText,
  InterimElement,
  InterimNodeKind,
  InterimSlotNode,
  InterimComponent,
  InterimModule,
  StaticAttributeValuePart,
  InterimAttributeValuePart,
  InterimConjunctionOperator,
  DynamicAttributeValuePart,
  InterimAttributeValuePartKind,
  ShorthandAttributeValuePart,
  InterimAttributeValue
} from "paperclip-interim";
import { camelCase, omit } from "lodash";
import {
  InterimScriptExpressionKind,
  InterimScriptExpression
} from "paperclip-interim";
import {
  arrayJoin,
  createTranslateContext,
  getElementInstanceName,
  startBlock,
  endBlock,
  addBuffer,
  writeSourceNode,
  writeJoin,
  ContextWriter
} from "./utils";
import { Html5Entities } from "html-entities";
import { Context } from "./utils";
import { SourceNode } from "source-map";
import { CompilerOptions, PaperclipConfig } from "paperclip-utils";

const entities = new Html5Entities();

const UTILS = `

function getDefault(module) {
  return module.default || module;
}

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
}`.trim();

export type CodeCompilerOptions = {
  imports?: string;
  preflight: string;
  vendorName: string;
};

export const codeCompiler = ({
  preflight,
  imports = "",
  vendorName
}: CodeCompilerOptions) => {
  const translateExportedStyles = addBuffer([
    `export const classNames = {\n`,
    startBlock,
    (context: Context) =>
      writeJoin(
        Object.keys(context.module.css.exports.classNames),
        ",\n",
        key =>
          addBuffer([
            JSON.stringify(key),
            ": ",
            JSON.stringify(context.module.css.exports.classNames[key])
          ])
      )(context),
    endBlock,
    "\n",
    "};"
  ]);

  const translateImports = (context: Context) => {
    return context.module.imports.reduce((context, imp) => {
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

      context = addBuffer([` from "${imp.relativePath}";`, "\n"])(context);

      return context;
    }, context);
  };

  const compileComponents = (context: Context) =>
    writeJoin(context.module.components, "\n", compileComponent)(context);

  const compileComponent = (component: InterimComponent) => {
    const tagName = component.as === "default" ? "$$Default" : component.as;

    return writeSourceNode(
      component.range.start,
      addBuffer([
        `var ${tagName} = ${vendorName}.memo(${vendorName}.forwardRef(function ${tagName}(props, ref) {`,
        "\n",
        startBlock,
        "return ",
        compileElement(component),
        endBlock,
        "\n",
        "}));\n",
        context => {
          if (!component.exported) {
            return context;
          }
          if (component.as === "default") {
            return addBuffer([`export default ${tagName};\n`])(context);
          } else {
            return addBuffer([`export { ${component.as} };\n`])(context);
          }
        }
      ])
    );
  };

  const compileElement = (element: InterimElement | InterimComponent) =>
    writeSourceNode(element.range.start, context => {
      context = addBuffer([`${vendorName}.createElement(`])(context);

      let tagName;

      if (element.tagName === "fragment") {
        tagName = `${vendorName}.Fragment`;
      } else {
        tagName = nativeOrInstanceTag(element, context);
      }

      if (element.attributes.tagName && !element.isInstance) {
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
      return getElementInstanceName(
        element.tagName,
        element.innerTagName,
        context
      );
    }

    return `"${element.tagName}"`;
  };

  const compileAttributes = (element: InterimElement | InterimComponent) => (
    context: Context
  ) => {
    context = addBuffer(["{\n", startBlock])(context);

    context = writeClassAttribute(element)(context);

    const omitAttributeNames = ["class"];

    if (!element.isInstance) {
      omitAttributeNames.push("tagName");
    }

    const attrKeys = Object.keys(omit(element.attributes, omitAttributeNames));

    if (element.kind === InterimNodeKind.Component) {
      context = addBuffer([`"ref": ref,\n`])(context);
    }

    // context = addBuffer([`"key": "${element.id}",\n`])(context);

    context = writeJoin(
      attrKeys,
      ",\n",
      key =>
        addBuffer([
          addBuffer([JSON.stringify(key), ": "]),
          compileAttributeValue(
            element,
            key,
            element.attributes[key].variants,
            () => write => write
          )
        ]),
      true
    )(context);

    return addBuffer([endBlock, "}"])(context);
  };

  const writeClassAttribute = (element: InterimElement | InterimComponent) => (
    context: Context
  ) => {
    let writeClassValue = addBuffer([
      `"${element.scopeClassNames.join(" ")}"`,
      element.attributes.class &&
        addBuffer([
          ` + `,
          compileAttributeValue(
            element,
            "class",
            element.attributes.class.variants,
            conditional =>
              conditional
                ? compileConditionalClassNamePart
                : compileEssentialClassNamePart
          )
        ])
    ]);

    if (element.tagName === "fragment") {
      if (element.attributes.tagName) {
        const inner = writeClassValue;
        writeClassValue = addBuffer(["props.tagName", " ? ", inner, " : null"]);
      } else {
        return context;
      }
    }

    return addBuffer([
      `${element.isInstance ? '"class"' : '"className"'}: `,
      writeClassValue,
      ",\n"
    ])(context);
  };

  const compileConditionalClassNamePart = (inner: ContextWriter) =>
    addBuffer(["(", inner, " ? ", `" " + `, inner, ` : `, `""`, ")"]);

  const compileEssentialClassNamePart = (inner: ContextWriter) =>
    addBuffer([`" " + `, inner]);

  const compileAttributeValue = (
    element: InterimElement | InterimComponent,
    attrName: string,
    variants: InterimAttributeValue[],
    outer: (conditional: boolean) => (inner: ContextWriter) => ContextWriter
  ) =>
    writeJoin(variants, ` + `, variant => context => {
      if (!variant.parts) {
        return addBuffer([`true`])(context);
      }

      if (variant.variantName) {
        context = addBuffer([
          "(",
          prop(variant.variantName),
          " ? ",
          compileVariantParts(element, attrName, variant.parts, outer),
          ` : "")`
        ])(context);
      } else {
        context = compileVariantParts(
          element,
          attrName,
          variant.parts,
          outer
        )(context);
      }
      return context;
    });

  const compileVariantParts = (
    element: InterimElement | InterimComponent,
    attrName: string,
    parts: InterimAttributeValuePart[],
    outer: (conditional: boolean) => (inner: ContextWriter) => ContextWriter
  ) => (context: Context) => {
    let write = writeJoin(
      parts,
      " + ",
      compileAttributeValuePart(attrName, outer)
    );

    if (attrName === "style") {
      write = addBuffer([`castStyle(`, write, `)`]);
    }

    if (
      attrName === "src" &&
      !element.isInstance &&
      context.targetOptions.importAssetsAsModules === true &&
      parts.length === 1 &&
      parts[0].kind === InterimAttributeValuePartKind.Static
    ) {
      write = addBuffer([`getDefault(require(`, write, `))`]);
    }

    return write(context);
  };

  const prop = (name: string) => `props["${name}"]`;

  const compileAttributeValuePart = (
    name: string,
    format: (conditional: boolean) => (write: ContextWriter) => ContextWriter
  ) => (part: InterimAttributeValuePart) => {
    switch (part.kind) {
      case InterimAttributeValuePartKind.Dynamic:
        return compileDynamicAttributePart(part, format);
      case InterimAttributeValuePartKind.Static:
        return compileStaticAttributePart(part, format);
      case InterimAttributeValuePartKind.Shorthand:
        return compileShorthandAttributePart(name, part, format);
    }
  };

  const compileDynamicAttributePart = (
    part: DynamicAttributeValuePart,
    outer: (conditional: boolean) => (inner: ContextWriter) => ContextWriter
  ) => {
    let write = compileScript(part.script);
    if (outer) {
      const prev = write;
      write = outer(true)(prev);
    } else {
      write = addBuffer(["(", write, " || ", '""', ")"]);
    }

    return writeSourceNode(part.range?.start, write);
  };

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

  const compileStaticAttributePart = (
    part: StaticAttributeValuePart,
    outer: (conditional: boolean) => (inner: ContextWriter) => ContextWriter
  ) =>
    writeSourceNode(
      part.range?.start,
      outer(false)(addBuffer([JSON.stringify(part.value)]))
    );

  const compileShorthandAttributePart = (
    name: string,
    part: ShorthandAttributeValuePart,
    outer: (conditional: boolean) => (inner: ContextWriter) => ContextWriter
  ) => writeSourceNode(part.range?.start, outer(true)(addBuffer([prop(name)])));

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

    // context = addBuffer([`[\n`])(context);
    context = addBuffer(["\n", startBlock])(context);
    context = writeJoin(children, ",\n", child => {
      switch (child.kind) {
        case InterimNodeKind.Element: {
          return compileElement(child);
        }
        case InterimNodeKind.Text: {
          return compileText(child);
        }
        case InterimNodeKind.Slot: {
          return compileSlot(child);
        }
      }
    })(context);
    context = addBuffer(["\n", endBlock])(context);

    return context;
    // return addBuffer([endBlock, `]`])(context);
  };

  return (
    module: InterimModule,
    filePath: string,
    config: PaperclipConfig,
    targetOptions: CompilerOptions,
    includes: string[]
  ) => {
    const context = writeSourceNode(
      { line: 1, column: 1, pos: 1 },
      addBuffer([
        imports,
        translateImports,
        writeJoin(
          includes,
          "\n",
          include => addBuffer([`import "${include}";`]),
          true
        ),
        preflight,
        UTILS,
        "\n\n",
        translateExportedStyles,
        "\n\n",
        compileComponents,
        "\n\n"
      ])
    )(createTranslateContext(module, filePath, config, targetOptions));
    return (context.buffer[0] as SourceNode).toStringWithSourceMap();
  };
};
