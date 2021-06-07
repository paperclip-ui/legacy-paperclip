import { kebabCase } from "lodash";
import {
  cleanLabel,
  DesignDependency,
  ExportSettings,
  FontDependency,
  getNodeExportFileName
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
  return `designs/${name}/index.pc`;
};

export const getLayerMediaPath = (
  node,
  dep: DesignDependency,
  settings: ExportSettings
) => {
  return `assets/${getNodeExportFileName(node, dep.document, settings)}`;
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

export const getStyleVarName = ({ name }) => {
  return `--${kebabCase(name)}`;
};

export const getStyleMixinName = ({ name }) => {
  let varName = kebabCase(name);
  if (!isNaN(Number(varName.charAt(0)))) {
    varName = "_" + varName;
  }
  return varName;
};

export const getStyleName = (style: any) => {
  return isStyleVar(style) ? getStyleVarName(style) : getStyleMixinName(style);
};

export const isStyleVar = (mixin: any) => {
  return mixin.styleType === "FILL";
};

export const isStyleMixin = (mixin: any) => {
  return mixin.styleType === "TEXT" || mixin.styleType === "EFFECT";
};
