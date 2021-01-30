import { ColorInfo } from "./base";
import {
  DependencyContent,
  DependencyContentKind,
  DependencyNodeContent,
  getStyleElements,
  KeyValueDeclaration,
  memoize,
  Rule,
  RuleKind,
  StyleDeclaration,
  StyleDeclarationKind,
  StyleElement,
  StyleRule
} from "paperclip-utils";

import * as parseColor from "color";

import CSS_COLOR_NAMES from "./css-color-names";
const CSS_COLOR_NAME_LIST = Object.keys(CSS_COLOR_NAMES);

const CSS_COLOR_NAME_REGEXP = new RegExp(
  `\\b(?<![-_])(${CSS_COLOR_NAME_LIST.join("|")})(?![-_])\\b`,
  "g"
);

type ASTInfo = {
  colors: ColorInfo[];
};

export const collectASTInfo = memoize(
  (content: DependencyContent): ASTInfo => {
    const info = { colors: [] };
    if (!content) {
      return info;
    }

    if (content.contentKind === DependencyContentKind.Node) {
      handleStyles(content, info);
    }

    return info;
  }
);

const handleStyles = (content: DependencyNodeContent, info: ASTInfo) => {
  const styles = getStyleElements(content);
  for (const style of styles) {
    handleStyle(style, info);
  }
};

const handleStyle = (style: StyleElement, info: ASTInfo) => {
  handleDeclarations(style.sheet.declarations, info);
  handleRules(style.sheet.rules, info);
};

const handleRules = (rules: Rule[], info: ASTInfo) => {
  for (const rule of rules) {
    if (rule.kind === RuleKind.Style) {
      handleStyleRule(rule, info);
    } else if (rule.kind === RuleKind.Mixin) {
      handleDeclarations(rule.declarations, info);
    } else if (rule.kind === RuleKind.Media) {
      handleRules(rule.rules, info);
      handleDeclarations(rule.declarations, info);
    } else if (rule.kind === RuleKind.Keyframes) {
      // keyframe doesn't have type so need to do this
      rule.rules.forEach(rule => handleDeclarations(rule.declarations, info));
    }
  }
};

const handleStyleRule = (rule: StyleRule, info: ASTInfo) => {
  handleDeclarations(rule.declarations, info);
  rule.children.forEach(child => handleStyleRule(child, info));
};

const handleDeclarations = (
  declarations: StyleDeclaration[],
  info: ASTInfo
) => {
  for (const declaration of declarations) {
    if (declaration.declarationKind === StyleDeclarationKind.KeyValue) {
      handleKeyValueDeclaration(declaration, info);
    } else if (declaration.declarationKind === StyleDeclarationKind.Include) {
      handleDeclarations(declaration.declarations, info);
    } else if (declaration.declarationKind === StyleDeclarationKind.Media) {
      handleDeclarations(declaration.declarations, info);
      handleRules(declaration.rules, info);
    }
  }
};

const handleKeyValueDeclaration = (
  declaration: KeyValueDeclaration,
  info: ASTInfo
) => {
  const colors =
    matchColor(declaration.value) ||
    declaration.value.match(/#[^\s,;]+|(var)\(.*?\)/g) ||
    [];

  let modelDecl = declaration.value;

  for (const color of colors) {
    let colorValue;
    if (/var\(.*?\)/.test(color)) {
      // const name = color.match(/var\((.*?)\)/)[1];
      // const value = getVariableValue(name, context.data);
      // if (value) {
      //   const match = matchColor(value);
      //   if (match) {
      //     colorValue = match[0];
      //   }
      // }
    } else {
      colorValue = color;
    }

    if (!colorValue) {
      continue;
    }

    const colorIndex = modelDecl.indexOf(color);

    // ensure that color isn't there in case there is another instance
    // in the string -- want to go through each one.
    modelDecl = modelDecl.replace(color, "_".repeat(color.length));

    // Color(color)
    // const {color: [r, g, b], valpha: a } = Color(color);
    const colorStart = declaration.valueLocation.start + colorIndex;

    const rgba = maybeParseColor(colorValue);
    if (rgba) {
      info.colors.push({
        color: rgba,
        location: { start: colorStart, end: colorStart + color.length }
      });
    }
  }
};

const matchColor = (value: string) => {
  return (
    value.match(/#[a-zA-Z0-9]+|(rgba|rgb|hsl|hsla|var)\(.*?\)/g) ||
    value.match(CSS_COLOR_NAME_REGEXP)
  );
};

const maybeParseColor = (value: string) => {
  try {
    const {
      color: [red, green, blue],
      valpha: alpha
    } = parseColor(value);

    return {
      red: red / 255,
      green: green / 255,
      blue: blue / 255,
      alpha
    };
  } catch (e) {
    console.error(e.stack);
  }

  return null;
};
