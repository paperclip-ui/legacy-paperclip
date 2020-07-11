import { Token, tokenize, TokenScanner, TokenKind } from "./tokenizer";

export enum SuggestContextKind {
  // HTML
  HTML_TAG_NAME = "HTML_TAG_NAME",
  HTML_ATTRIBUTE_NAME = "HTML_ATTRIBUTE_NAME",
  HTML_STRING_ATTRIBUTE_VALUE = "HTML_STRING_ATTRIBUTE_VALUE",
  HTML_CSS_REFERENCE = "HTML_CSS_REFERENCE", // >>>reference

  // CSS
  CSS_INCLUDE = "CSS_INCLUDE",
  CSS_VARIABLE = "CSS_VARIABLE",
  CSS_SELECTOR_NAME = "CSS_SELECTOR_NAME",
  CSS_DECLARATION_NAME = "CSS_DECLARATION_NAME",
  CSS_DECLARATION_VALUE = "CSS_DECLARATION_VALUE",
  CSS_CLASS_REFERENCE = "CSS_CLASS_REFERENCE",
  CSS_DECLARATION_AT_RULE = "CSS_DECLARATION_AT_RULE",
  CSS_AT_RULE_PARAMS = "CSS_AT_RULE_PARAMS",
  CSS_AT_RULE_NAME = "CSS_AT_RULE_NAME"
}

type BaseSuggestContext<TKind extends SuggestContextKind> = {
  kind: TKind;
};

export type HTMLAttributeStringValueContext = {
  tagPath: string[];
  attributeName: string;
  attributeValuePrefix: string;
} & BaseSuggestContext<SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE>;

export type HTMLAttributeNameSuggestionContext = {
  tagPath: string[];
  prefix: string;
} & BaseSuggestContext<SuggestContextKind.HTML_ATTRIBUTE_NAME>;

export type HTMLTagNameSuggestionContext = {
  path: string[];
} & BaseSuggestContext<SuggestContextKind.HTML_TAG_NAME>;

export type CSSDeclarationSuggestionContext = {
  prefix: string;
} & BaseSuggestContext<SuggestContextKind.CSS_DECLARATION_NAME>;

export type CSSDeclarationValueSuggestionContext = {
  declarationName: string;
  declarationValuePrefix: string;
} & BaseSuggestContext<SuggestContextKind.CSS_DECLARATION_VALUE>;

export type CSSDeclarationAtRuleSuggestionContext = {
  prefix: string;
} & BaseSuggestContext<SuggestContextKind.CSS_DECLARATION_AT_RULE>;

export type CSSAtRuleSuggestionContext = {
  prefix: string;
} & BaseSuggestContext<SuggestContextKind.CSS_AT_RULE_NAME>;

export type CSSDeclarationAtRuleParamsSuggestionContext = {
  atRuleName: string;
  params: string;
} & BaseSuggestContext<SuggestContextKind.CSS_AT_RULE_PARAMS>;

export type CSSVariableSuggestionContext = {
  prefix: string;
} & BaseSuggestContext<SuggestContextKind.CSS_VARIABLE>;

export type CSSClassReferenceSuggestionContext = {
  prefix: string;
} & BaseSuggestContext<SuggestContextKind.CSS_CLASS_REFERENCE>;

export type SuggestContext =
  | HTMLAttributeStringValueContext
  | HTMLTagNameSuggestionContext
  | HTMLAttributeNameSuggestionContext
  | CSSDeclarationSuggestionContext
  | CSSDeclarationValueSuggestionContext
  | CSSDeclarationAtRuleSuggestionContext
  | CSSDeclarationAtRuleParamsSuggestionContext
  | CSSClassReferenceSuggestionContext
  | CSSVariableSuggestionContext
  | CSSAtRuleSuggestionContext;

export const getSuggestionContext = (source: string) => {
  let context: SuggestContext = null;

  const scanner = tokenize(source);

  // scan until there's something useful
  while (scanner.current) {
    if (scanner.current.value === "<") {
      context = suggestElement(scanner);
    }

    scanner.next();
  }

  return context;
};

const suggestElement = (scanner: TokenScanner): SuggestContext | null => {
  const [tagSuggestion, tagPath] = suggestTagName(scanner);

  if (tagSuggestion) {
    return tagSuggestion;
  }

  const attrSuggestion = suggestAttribute(tagPath, scanner);

  if (attrSuggestion) {
    return attrSuggestion;
  }

  if (tagPath.length === 1 && tagPath[0] === "style") {
    const cssSuggestion = suggestCSS(scanner);
    if (cssSuggestion) {
      return cssSuggestion;
    }
  }

  return null;
};

const suggestTagName = (scanner: TokenScanner): [SuggestContext, string[]] => {
  scanner.next(); // eat <

  // Source possibility: `<div></div><`
  if (!scanner.current) {
    return [{ kind: SuggestContextKind.HTML_TAG_NAME, path: [] }, null];
  }

  let path = [];
  let cpart = "";

  // capture tag name
  while (scanner.current) {
    // stop at whitespace, or /?>
    if (/[>\/\s]/.test(scanner.current.value)) {
      if (cpart.length) {
        path.push(cpart);
      }
      break;
    } else if (scanner.current.value === ".") {
      path.push(cpart);
      cpart = "";
    } else {
      cpart += scanner.current.value;
    }
    scanner.next();
    if (!scanner.current) {
      path.push(cpart);
    }
  }

  // Source possibility: `<importedRef.`, `<importedRef.my-comp`
  if (!scanner.current) {
    return [{ kind: SuggestContextKind.HTML_TAG_NAME, path }, null];
  }

  return [null, path];
};

const suggestAttribute = (
  tagPath: string[],
  scanner: TokenScanner
): SuggestContext => {
  // scan for attributes
  while (scanner.current) {
    scanner.skipWhitespace();

    // possibility: `<a b `, `<a `
    if (!scanner.current) {
      return {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        prefix: "",
        tagPath
      };
    }

    // stop at /?>
    if (/[\>\/]/.test(scanner.current.value)) {
      break;
    }

    const attrName = getAttributeName(scanner);

    if (!scanner.current) {
      return {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        prefix: attrName,
        tagPath
      };
    }

    if (scanner.current.value === "=") {
      scanner.next();
      const context = suggestAttributeValue(tagPath, attrName, scanner);
      if (context) {
        return context;
      }
    }
  }

  return null;
};

const suggestAttributeValue = (
  tagPath: string[],
  attributeName: string,
  scanner: TokenScanner
): SuggestContext => {
  if (scanner.current.value === `"` || scanner.current.value === `'`) {
    const boundary = scanner.current.value;

    scanner.next();
    let prefix = "";

    while (1) {
      if (!scanner.current) {
        return {
          kind: SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE,
          tagPath,
          attributeName,
          attributeValuePrefix: prefix
        };
      } else if (scanner.current.value === boundary) {
        break;
      } else if (
        String(scanner.current?.value) === ">" &&
        scanner.peek()?.value === ">" &&
        scanner.peek(1)?.value === ">"
      ) {
        scanner.next(); // eat >
        scanner.next(); // eat >
        scanner.next(); // eat >
        if (!scanner.current) {
          return {
            kind: SuggestContextKind.CSS_CLASS_REFERENCE,
            prefix: ""
          };
        }

        const prefix = scanner.current.value;

        scanner.next();
        if (!scanner.current) {
          return {
            kind: SuggestContextKind.CSS_CLASS_REFERENCE,
            prefix
          };
        }
      }

      prefix += scanner.current.value;

      scanner.next();
    }

    scanner.next(); // eat "
  } else if (scanner.current.value === `{`) {
    // TODO - move to slot

    while (scanner.current && String(scanner.current.value) !== `}`) {
      if (String(scanner.current.value) === "<") {
        const sugg = suggestElement(scanner);
        if (sugg) {
          return sugg;
        }
      }
      scanner.next();
    }
  }

  return null;
};

const suggestCSS = (scanner: TokenScanner): SuggestContext => {
  while (scanner.current) {
    // close tag </
    if (startOfCloseTag(scanner)) {
      break;
    } else if (scanner.current.value === "@") {
      const declSuggestion = suggestCSSAtRule(
        scanner,
        SuggestContextKind.CSS_AT_RULE_NAME
      );
      if (declSuggestion) {
        return declSuggestion;
      }
    }

    if (scanner.current.value === "{") {
      const declSuggestion = suggestCSSDeclarations(scanner);
      if (declSuggestion) {
        return declSuggestion;
      }
    }

    // if (scanner.current.kind === TokenKind.Word) {
    //   const selector = getBuffer(scanner, scanner => scanner.current.value !== "{");
    //   if (!scanner.current) {
    //     return { kind: SuggestContextKind.CSS_SELECTOR_NAME}
    //   }
    // }

    scanner.next();
  }

  return null;
};

const suggestCSSDeclarations = (scanner: TokenScanner): SuggestContext => {
  scanner.next(); // eat {

  while (1) {
    const ws = scanner.current?.value;
    scanner.skipWhitespace();

    if (!scanner.current) {
      // only suggest declaration if on new line -- UX is wierd otherwise
      if (ws && /[\n\r]/.test(ws)) {
        return { kind: SuggestContextKind.CSS_DECLARATION_NAME, prefix: "" };
      }
      return null;
    }

    if (scanner.current.value === "}") {
      break;
    }

    if (scanner.current.kind === TokenKind.Word) {
      const declSuggestion = suggestCSSDeclaration(scanner);
      if (declSuggestion) {
        return declSuggestion;
      }
    } else if (scanner.current.value === "@") {
      const declSuggestion = suggestCSSAtRule(
        scanner,
        SuggestContextKind.CSS_DECLARATION_AT_RULE
      );
      if (declSuggestion) {
        return declSuggestion;
      }
    }

    scanner.next();
  }

  scanner.next(); // eat }

  return null;
};

const suggestCSSDeclaration = (scanner: TokenScanner): SuggestContext => {
  const name = scanner.current.value;

  scanner.next(); // eat name
  scanner.skipWhitespace();

  if (!scanner.current) {
    return { kind: SuggestContextKind.CSS_DECLARATION_NAME, prefix: name };
  }

  if (scanner.current.value === ":") {
    scanner.next(); // eat :
    const valueSuggestion = suggestCSSDeclarationValue(name, scanner);
    if (valueSuggestion) {
      return valueSuggestion;
    }
  }

  return null;
};
const suggestCSSAtRule = (
  scanner: TokenScanner,
  atRuleKind:
    | SuggestContextKind.CSS_AT_RULE_NAME
    | SuggestContextKind.CSS_DECLARATION_AT_RULE
): SuggestContext => {
  scanner.next(); // eat @

  if (!scanner.current) {
    return { kind: atRuleKind, prefix: "" };
  }

  const prefix = scanner.current.value;

  scanner.next();

  if (!scanner.current) {
    return { kind: atRuleKind, prefix };
  }

  let params = "";

  while (
    scanner.current &&
    scanner.current.value !== ";" &&
    scanner.current.value !== "{"
  ) {
    params += scanner.current.value;
    scanner.next();

    if (!scanner.current) {
      return {
        kind: SuggestContextKind.CSS_AT_RULE_PARAMS,
        atRuleName: prefix,
        params: params.trim()
      };
    }
  }

  return null;
};

const suggestCSSDeclarationValue = (
  declarationName: string,
  scanner: TokenScanner
): SuggestContext => {
  let currentChunk = "";

  while (1) {
    scanner.skipWhitespace();

    if (!scanner.current) {
      return {
        kind: SuggestContextKind.CSS_DECLARATION_VALUE,
        declarationName,
        declarationValuePrefix: currentChunk
      };
    }

    if (scanner.current.value === ";") {
      break;
    }

    currentChunk = scanner.current.value;

    if (currentChunk === "var" && scanner.peek()?.value === "(") {
      scanner.next(); // eat var
      scanner.next(); // eat (
      if (!scanner.current) {
        return {
          kind: SuggestContextKind.CSS_VARIABLE,
          prefix: ""
        };
      }
      let buffer = getBuffer(
        scanner,
        scanner =>
          scanner.current.value === "-" ||
          scanner.current.kind === TokenKind.Word
      );
      if (!scanner.current) {
        return {
          kind: SuggestContextKind.CSS_VARIABLE,
          prefix: buffer
        };
      }
    }

    scanner.next();
  }

  return null;
};

const startOfCloseTag = (scanner: TokenScanner) => {
  return scanner.current.value === "<" && scanner.peek()?.value === "/";
};

const getAttributeName = (scanner: TokenScanner) => {
  return getBuffer(
    scanner,
    scanner =>
      scanner.current.value !== "=" &&
      scanner.current.value !== ">" &&
      scanner.current.kind !== TokenKind.Whitespace
  );
};

const skipUntil = (
  scanner: TokenScanner,
  test: (scanner: TokenScanner) => boolean
) => {
  getBuffer(scanner, test);
};

const getBuffer = (
  scanner: TokenScanner,
  test: (scanner: TokenScanner) => boolean
) => {
  let buffer = "";
  while (scanner.current && test(scanner)) {
    buffer += scanner.current.value;
    scanner.next();
  }
  return buffer;
};
