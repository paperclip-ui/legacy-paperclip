import { kebabCase } from "lodash";
import { DesignDependency, FontDependency } from "../state";
import { addBuffer, endBlock, startBlock, TranslateContext2 } from "./context";

export const getFontFile = (dep: FontDependency) =>
  `typography/${dep.fileKey}.pc`;
export const getDesignPageFile = (page: any, dep: DesignDependency) =>
  `designs/${kebabCase(dep.name)}/pages/${kebabCase(page.name)}.pc`;
export const getDesignModulesFile = (dep: DesignDependency) =>
  `designs/${kebabCase(dep.name)}/index.pc`;

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
