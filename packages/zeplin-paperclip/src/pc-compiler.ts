import { VariableMap, ColorFormat, TypographyMap } from "./state";
import Layer from "zeplin-extension-style-kit/elements/layer";
import TextStyle from "zeplin-extension-style-kit/elements/textStyle";
import { castLayer } from "./cast";
import { generateIdentifier, pascalCase } from "./utils";
import { camelCase, omit } from "lodash";

export const compileGlobalVariables = (map: VariableMap) => {
  const buffer = [];

  const varMap = {};

  for (const key in map) {
    if (/var\(.*?\)/.test(key)) {
      varMap[key.replace(/var\((.*?)\)/, "$1")] = map[key];
    }
  }

  buffer.push(`<style>\n`);
  buffer.push(`  :root {\n`);
  for (const key in varMap) {
    buffer.push(`    ${key}: ${varMap[key]};\n`);
  }
  buffer.push(`  }\n`);
  buffer.push(`</style>\n`);

  return {
    code: buffer.join(""),
    varMap
  };
};

export const compileGlobalColorVariables = (map: VariableMap) => {
  const { code, varMap } = compileGlobalVariables(map);

  const buffer = [code];

  buffer.push(`<style>\n`);
  buffer.push(`  .preview {\n`);
  buffer.push(`    display: inline-block;\n`);
  buffer.push(`    background: #333;\n`);
  buffer.push(`    font-family: Helvetica;\n`);
  buffer.push(`    font-size: 24px;\n`);
  buffer.push(`    padding: 10px 20px;\n`);
  buffer.push(`    margin: 6px;\n`);
  buffer.push(`    border-radius: 6px;\n`);
  buffer.push(`  }\n`);
  buffer.push(`</style>\n`);

  buffer.push(`<!--\n`);
  buffer.push(`  @frame { title: "Colors" }\n`);
  buffer.push(`-->\n`);
  buffer.push("<div>\n");
  for (const name in map) {
    if (!/var\(.*?\)/.test(name)) {
      continue;
    }
    buffer.push(
      `  <div className="preview" style="color: ${name};">${name}</div>\n`
    );
  }

  buffer.push("</div>");
  return {
    code: buffer.join("")
  };
};

export const compileGlobalSpacingVariables = (map: VariableMap) => {
  const { code, varMap } = compileGlobalVariables(map);

  const buffer = [code];
  // TODO - preview
  return {
    code: buffer.join("")
  };
};

export const compileTypography = (
  map: TypographyMap,
  colorFormat: ColorFormat,
  variables: VariableMap
) => {
  const buffer = [];

  buffer.push(`<style>\n`);
  buffer.push(`  @export {\n`);
  for (const name in map) {
    const {
      style: { declarations }
    } = new TextStyle(map[name]);
    buffer.push(`    @mixin ${name} {\n`);
    for (const decl of declarations) {
      buffer.push(
        `      ${decl.name}: ${decl.getValue(
          { colorFormat, densityDivisor: 1, unitlessLineHeight: false },
          variables
        )};\n`
      );
    }
    buffer.push(`    }\n\n`);

    buffer.push(`    .${name} {\n`);
    buffer.push(`      @include ${name};\n`);
    buffer.push(`    }\n`);
  }
  buffer.push(`  }\n\n`);

  buffer.push(`  .preview {\n`);
  buffer.push(`    display: inline-block;\n`);
  buffer.push(`    padding: 6px 10px;\n`);
  buffer.push(`  }\n`);
  buffer.push(`</style>\n`);

  buffer.push(`<!--\n`);
  buffer.push(`  @frame { title: "Typography" }\n`);
  buffer.push(`-->\n`);

  buffer.push("<div>\n");
  for (const name in map) {
    buffer.push(
      `<span className="preview ${name}">.${name}<br /><br /></span>\n`
    );
  }
  buffer.push("</div>");

  // TODO - preview here

  return {
    code: buffer.join("")
  };
};

type RootInfo = {
  name: string;
  width: number;
  height: number;
};

export const compileLayers = (
  layers: any[],
  colorFormat: ColorFormat,
  variables: VariableMap,
  textStyles: TypographyMap,
  rootInfo: RootInfo
) => {
  const buffer = [];
  buffer.push(`<import src="../tokens/colors.pc" />\n`);
  buffer.push(`<import as="typography" src="../tokens/typography.pc" />\n`);
  buffer.push(`<import src="../tokens/spacing.pc" />\n\n`);

  // next, components
  buffer.push(`\n<!-- Components -->\n\n`);

  for (const rawLayer of layers) {
    const castedLayer = castLayer(rawLayer);
    const className = generateIdentifier(rawLayer.name);
    const componentName = pascalCase(rawLayer.name);

    const tagName = castedLayer.textStyles.length ? `span` : `div`;
    const [style, textMixins] = compileLayerStyles(
      rawLayer,
      colorFormat,
      variables,
      textStyles
    );

    buffer.push(`<!--\n`);
    buffer.push(`  @frame { visible: false }\n`);
    buffer.push(`-->\n`);

    buffer.push(
      `<${tagName} export component as="${componentName}" className="${textMixins
        .map(mixinName => ` $typography.${mixinName}`)
        .join("")} {className?}" className:absolute="absolute">\n`
    );
    buffer.push(style);
    buffer.push(`  {children}\n`);
    buffer.push(`</${tagName}>\n\n`);
  }

  // finally, preview

  buffer.push(`\n<!-- Preview -->\n\n`);
  buffer.push(`<!--\n`);
  buffer.push(
    `  @frame { title: ${JSON.stringify(rootInfo.name)}, width: ${
      rootInfo.width
    }, height: ${rootInfo.height} }\n`
  );
  buffer.push(`-->\n`);
  buffer.push(`<div>\n`);

  for (const rawLayer of layers) {
    const componentName = pascalCase(rawLayer.name);
    buffer.push(`  <${componentName} absolute>\n`);
    if (rawLayer.content) {
      buffer.push(`    ${rawLayer.content}\n`);
    }
    buffer.push(`  </${componentName}>\n`);
  }
  buffer.push(`</div>\n`);

  return buffer.join("");
};

const compileLayerStyles = (
  rawLayer: any,
  colorFormat: ColorFormat,
  variables: VariableMap,
  textStyles: TypographyMap
): [string, string[]] => {
  const buffer = ["  <style>\n"];
  const textMixins = [];
  const castedLayer = castLayer(rawLayer);
  const layer = new Layer(castedLayer, null);

  for (const decl of layer.style.declarations) {
    if (/^(width|height)$/.test(decl.name)) {
      continue;
    }
    buffer.push(
      `    ${decl.name}: ${decl.getValue(
        { colorFormat, densityDivisor: 1, unitlessLineHeight: false },
        variables
      )};\n`
    );
  }

  let mixedTextStyle = {};

  for (const textStyle of castedLayer.textStyles) {
    Object.assign(mixedTextStyle, textStyle);
  }

  for (const mixinName in textStyles) {
    const mixin = textStyles[mixinName];
    const isMatch = Object.keys(mixin).every(key => {
      const value = mixin[key];
      return key == "name" || mixedTextStyle[key] == value;
    });

    if (isMatch) {
      textMixins.push(mixinName);
      mixedTextStyle = omit(mixedTextStyle, Object.keys(mixin));
    }
  }
  const decls = layer.getLayerTextStyleDeclarations(mixedTextStyle);

  for (const decl of decls) {
    // Zeplin keeps d
    if (!mixedTextStyle[camelCase(decl.name)]) {
      continue;
    }
    buffer.push(
      `    ${decl.name}: ${decl.getValue(
        { colorFormat, densityDivisor: 1, unitlessLineHeight: false },
        variables
      )};\n`
    );
  }

  buffer.push(`    &.absolute {\n`);
  buffer.push(`      position: absolute;\n`);
  buffer.push(`      left: ${rawLayer.rect.x}px;\n`);
  buffer.push(`      top: ${rawLayer.rect.y}px;\n`);
  buffer.push(`      width: ${rawLayer.rect.width}px;\n`);
  buffer.push(`      height: ${rawLayer.rect.height}px;\n`);
  buffer.push(`    }\n`);
  buffer.push("  </style>\n");

  return [buffer.join(""), textMixins];
};
