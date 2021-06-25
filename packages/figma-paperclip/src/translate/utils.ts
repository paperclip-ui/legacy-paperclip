import { kebabCase } from "lodash";
import {
  cleanLabel,
  Config,
  containsNode,
  DesignDependency,
  ExportSettings,
  FontDependency,
  getCleanedName,
  getNodeExportFileName,
  getNodePage
} from "../state";
import { addBuffer, endBlock, startBlock, TranslateContext2 } from "./context";

export const getFontFile = (dep: FontDependency) =>
  `typography/${dep.fileKey}.pc`;
export const getDesignPageFile = (page: any, dep: DesignDependency) => {
  const name = kebabCase(cleanLabel(page.name));
  // non-ascii chars, so ignore
  if (!name) {
    return null;
  }

  return `designs/${kebabCase(cleanLabel(dep.name))}/pages/${name}.pc`;
};
export const getDesignModulesFile = (dep: DesignDependency) => {
  const name = kebabCase(cleanLabel(dep.name));

  // non-ascii chars, so ignore
  if (!name) {
    return null;
  }
  return `designs/${name}/atoms.pc`;
};

export const getMixinValue = (mixin: any, style: any) => {
  if (isStyleMixin(mixin)) {
    return style;
  } else if (isStyleVar(mixin)) {
    return style.color || style.background || style.borderColor;
  }
};

const getColorContrast = hexcolor => {
  // If a leading # is provided, remove it
  if (hexcolor.slice(0, 1) === "#") {
    hexcolor = hexcolor.slice(1);
  }

  // If a three-character hexcode, make six-character
  if (hexcolor.length === 3) {
    hexcolor = hexcolor
      .split("")
      .map(function(hex) {
        return hex + hex;
      })
      .join("");
  }

  // Convert to RGB value
  var r = parseInt(hexcolor.substr(0, 2), 16);
  var g = parseInt(hexcolor.substr(2, 2), 16);
  var b = parseInt(hexcolor.substr(4, 2), 16);

  // Get YIQ ratio
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Check contrast
  return yiq >= 128 ? "black" : "white";
};

export const getLayerMediaPath = (
  node,
  dep: DesignDependency,
  settings: ExportSettings
) => {
  return `designs/${getCleanedName(dep.name)}/${getCleanedName(
    getNodePage(node.id, dep.document).name
  )}/${getNodeExportFileName(node, dep.document, settings)}`;
};
export type WriteElementBlockParts = {
  tagName: string;
  attributes?: string;
};

export const writeElementBlock = (
  { tagName, attributes }: WriteElementBlockParts,
  writeBody: (context: TranslateContext2) => TranslateContext2,
  context: TranslateContext2
) => {
  context = addBuffer(
    `<${tagName}${attributes ? " " + attributes : ""}>\n`,
    context
  );
  context = startBlock(context);
  context = writeBody(context);
  context = endBlock(context);
  context = addBuffer(`</${tagName}>\n`, context);
  return context;
};

export const writeStyleDeclaration = (
  name: string,
  value: string,
  context: TranslateContext2,
  format = true
) => {
  if (name === "@include") {
    return addBuffer(`@include ${value};\n`, context);
  } else {
    return addBuffer(
      `${format ? kebabCase(name) : name}: ${value};\n`,
      context
    );
  }
};

export const writeStyleDeclarations = (
  style: any,
  context: TranslateContext2
) => {
  for (const propertyName in style) {
    const value = style[propertyName];
    if (Array.isArray(value)) {
      for (const part of value) {
        context = writeStyleDeclaration(propertyName, part, context);
      }
    } else {
      context = writeStyleDeclaration(propertyName, value, context);
    }
  }
  return context;
};

export const writeStyleBlock = (
  selector: string,
  writeBody: (context: TranslateContext2) => TranslateContext2,
  context: TranslateContext2
) => {
  context = addBuffer(`${selector} {\n`, context);
  context = startBlock(context);
  context = writeBody(context);
  context = endBlock(context);
  context = addBuffer(`}\n`, context);
  return context;
};

export const getStyleVarName = ({ name }, config: Config) => {
  if (config.atoms?.typePrefix) {
    name = `color-` + name;
  }
  return `--${kebabCase(name)}`;
};

export const getStyleMixinName = ({ name, styleType }, config: Config) => {
  if (config.atoms?.typePrefix) {
    name = `${styleType}-` + name;
  }

  let varName = kebabCase(name);

  if (!isNaN(Number(varName.charAt(0)))) {
    varName = "_" + varName;
  }
  return varName;
};

export const getMixinName = (style: any, config: Config) => {
  return isStyleVar(style)
    ? getStyleVarName(style, config)
    : getStyleMixinName(style, config);
};

export const isStyleVar = (mixin: any) => {
  return mixin.styleType === "FILL";
};

export const isStyleMixin = (mixin: any) => {
  return mixin.styleType === "TEXT" || mixin.styleType === "EFFECT";
};
