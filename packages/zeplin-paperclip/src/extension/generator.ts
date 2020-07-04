import Mixin from "zeplin-extension-style-kit/declarations/mixin";
import {
  isDeclarationInherited,
  isHtmlTag
} from "zeplin-extension-style-kit/utils";
import { generateIdentifier } from "./utils";

const PREFIX = "@";
const SEPARATOR = ": ";
const SUFFIX = ";";
const INDENTATION = "  ";

class PCSS {
  params: any;
  variables: any;

  constructor(variables, params) {
    this.variables = variables;
    this.params = params;

    Object.keys(variables).forEach(vName => {
      this.variables[vName] = `${PREFIX}${variables[vName]}`;
    });
  }

  filterDeclarations(childDeclarations, parentDeclarations, isMixin) {
    const {
      params: { showDefaultValues, showDimensions }
    } = this;

    return childDeclarations.filter(declaration => {
      if (
        !showDimensions &&
        (declaration.name === "width" || declaration.name === "height")
      ) {
        return false;
      }

      const parentDeclaration = parentDeclarations.find(
        p => p.name === declaration.name
      );

      if (parentDeclaration) {
        if (!parentDeclaration.equals(declaration)) {
          return true;
        }

        return !isDeclarationInherited(declaration.name);
      }

      if (declaration.hasDefaultValue && declaration.hasDefaultValue()) {
        return !isMixin && showDefaultValues;
      }

      return true;
    });
  }

  declaration(p, mixin?) {
    if (p instanceof Mixin) {
      return `${INDENTATION}.${p.identifier.toLowerCase()}()${SUFFIX}`;
    }

    let { params } = this;

    if (mixin) {
      params = Object.assign({}, params, { showDefaultValues: false });
    }

    return `${INDENTATION}${p.name}${SEPARATOR}${p.getValue(
      params,
      this.variables
    )}${SUFFIX}`;
  }

  variable(name, value) {
    return `${PREFIX}${generateIdentifier(
      name
    )}${SEPARATOR}${value.toStyleValue(this.params)}${SUFFIX}`;
  }

  ruleSet(
    { selector, declarations },
    { parentDeclarations = [], mixin = false } = {}
  ) {
    const isMixin = !isHtmlTag(selector) && mixin;
    const filteredDeclarations = this.filterDeclarations(
      declarations,
      parentDeclarations,
      isMixin
    );
    const ruleSelector = isMixin ? selector.toLowerCase() : selector;

    return `${ruleSelector}${
      isMixin ? "()" : ""
    } {\n${filteredDeclarations
      .map(p => this.declaration(p, isMixin))
      .join("\n")}\n}`;
  }

  atRule({ identifier, declarations }) {
    return `@${identifier} {\n${declarations
      .map(p => this.declaration(p))
      .join("\n")}\n}`;
  }
}

export default PCSS;
