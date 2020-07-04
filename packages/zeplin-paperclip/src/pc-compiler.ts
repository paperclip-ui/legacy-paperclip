import { VariableMap, ColorFormat, TypographyMap } from "./state";
import Layer from "zeplin-extension-style-kit/elements/layer";
import FontFace from "zeplin-extension-style-kit/elements/fontFace";
import TextStyle from "zeplin-extension-style-kit/elements/textStyle";
import Color from "zeplin-extension-style-kit/values/color";
import RuleSet from "zeplin-extension-style-kit/ruleSet";
import * as zmodel from "@zeplin/extension-model";
import { castLayer, castColor } from "./cast";
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

  // TODO - preview here

  return {
    code: buffer.join("")
  };
};

export const compileGlobalSpacingVariables = (map: VariableMap) => {
  const { code, varMap } = compileGlobalVariables(map);

  const buffer = [code];

  // TODO - preview here

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
  buffer.push(`  }\n`);
  buffer.push(`</style>\n`);

  buffer.push(`\n<!-- previews -->\n`);
  for (const name in map) {
    buffer.push(`<span className="${name}">.${name}<br /><br /></span>\n`);
  }

  // TODO - preview here

  return {
    code: buffer.join("")
  };
};

export const compileLayers = (
  layers: any[],
  colorFormat: ColorFormat,
  variables: VariableMap,
  textStyles: TypographyMap
) => {
  const buffer = [];
  buffer.push(`<import src="../atoms/colors.pc">\n`);
  buffer.push(`<import src="../atoms/typography.pc">\n`);
  buffer.push(`<import as="typography" src="../atoms/spacing.pc">\n\n`);
  buffer.push(`<style>\n`);

  // compile the styles first
  for (const rawLayer of layers) {
    const className = generateIdentifier(rawLayer.name);
    buffer.push(`  .${className} {\n`);
    const castedLayer = castLayer(rawLayer);
    const layer = new Layer(castedLayer);

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

    const mixinMap = {};
    let foundMixin;
    let style = {};

    for (const textStyle of castedLayer.textStyles) {
      const decls = layer.getLayerTextStyleDeclarations(textStyle);

      for (const decl of decls) {
        style[decl.name] = decl.getValue(
          { colorFormat, densityDivisor: 1, unitlessLineHeight: false },
          variables
        );
      }
    }

    for (const mixinName in textStyles) {
      const mixin = textStyles[mixinName];
      const isMatch = Object.keys(mixin).every(key => {
        const value = mixin[key];
        return style[key] == value;
      });

      if (isMatch) {
        if (!mixinMap[className]) {
          mixinMap[className] = [];
        }
        mixinMap[className].push(mixinName);

        style = omit(style, Object.keys(mixin));
      }
    }

    for (const key in style) {
      buffer.push(`    ${key}: ${style[key]};\n`);
    }

    buffer.push(`    &.absolute {\n`);
    buffer.push(`      position: absolute;\n`);
    buffer.push(`      left: ${rawLayer.rect.x}px;\n`);
    buffer.push(`      top: ${rawLayer.rect.y}px;\n`);
    buffer.push(`      width: ${rawLayer.rect.width}px;\n`);
    buffer.push(`      height: ${rawLayer.rect.height}px;\n`);
    buffer.push(`    }\n`);
    buffer.push(`  }\n\n`);
  }

  buffer.push(`</style>\n\n`);

  // next, components
  buffer.push(`\n<!-- Components -->\n`);

  for (const rawLayer of layers) {
    const castedLayer = castLayer(rawLayer);
    const className = generateIdentifier(rawLayer.name);
    const componentName = pascalCase(rawLayer.name);

    const tagName = castedLayer.textStyles.length ? `span` : `div`;

    buffer.push(
      `<${tagName} export component as="${componentName}" className="${className}" className:absolute>\n`
    );
    buffer.push(`  {children}\n`);
    buffer.push(`</${tagName}>\n\n`);
  }

  // finally, preview

  buffer.push(`\n<!-- Preview -->\n`);
  buffer.push(`<div className="preview">\n`);

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
