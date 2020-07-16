import { Token, tokenize, TokenScanner, TokenKind } from "./tokenizer";

export enum SuggestContextKind {
  // HTML
  HTML_TAG_NAME = "HTML_TAG_NAME",
  HTML_CLOSE_TAG_NAME = "HTML_CLOSE_TAG_NAME",
  HTML_ATTRIBUTE_NAME = "HTML_ATTRIBUTE_NAME",
  HTML_STRING_ATTRIBUTE_VALUE = "HTML_STRING_ATTRIBUTE_VALUE",
  HTML_CSS_REFERENCE = "HTML_CSS_REFERENCE", // >>>reference

  // CSS
  CSS_INCLUDE = "CSS_INCLUDE",
  CSS_FUNCTION = "CSS_FUNCTION",
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

export type HTMLCloseTagNameSuggestionContext = {
  openTagPath: string[];
} & BaseSuggestContext<SuggestContextKind.HTML_CLOSE_TAG_NAME>;

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

export type CSSFunctionSuggestionContext = {
  name: string;
  paramsPrefix: string;
} & BaseSuggestContext<SuggestContextKind.CSS_FUNCTION>;

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
  | HTMLCloseTagNameSuggestionContext
  | CSSClassReferenceSuggestionContext
  | CSSFunctionSuggestionContext
  | CSSAtRuleSuggestionContext;

export const getSuggestionContext = (source: string) => {
  let context: SuggestContext = null;

  const scanner = tokenize(source);

  // scan until there's something useful
  while (scanner.current) {
    if (scanner.current.value === "<") {
      scanner.next(); // eat <
      context = suggestElement(scanner);
    } else {
      scanner.next();
    }
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

  if (scanner.current?.value === ">" && !/^(import|img)$/.test(tagPath[0])) {
    scanner.next(); // eat

    if (!scanner.current) {
      return {
        kind: SuggestContextKind.HTML_CLOSE_TAG_NAME,
        openTagPath: tagPath
      };
    }

    if (tagPath.length === 1 && tagPath[0] === "style") {
      const cssSuggestion = suggestCSS(scanner);
      if (cssSuggestion) {
        return cssSuggestion;
      }
    }

    let closed = false;
    while (scanner.current) {
      if (String(scanner.current.value) === "<") {
        scanner.next(); // eat <
        if (String(scanner.current?.value) === "/") {
          scanner.next(); // eat /
          if (scanner.current?.kind === TokenKind.Word) {
            scanner.next(); // eat tag

            if (scanner.current?.value === ">") {
              scanner.next(); // >
              closed = true;
              break;
            }
          }
        } else if (tagPath[0] !== "style") {
          const child = suggestElement(scanner);
          if (child) {
            return child;
          }
        }
      } else {
        scanner.next();
      }
    }

    if (!closed && tagPath[0] !== "style") {
      return {
        kind: SuggestContextKind.HTML_CLOSE_TAG_NAME,
        openTagPath: tagPath
      };
    }
  }

  return null;
};

const suggestTagName = (scanner: TokenScanner): [SuggestContext, string[]] => {
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
    scanner.skipSuperfluous();

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
        scanner.next();
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
    scanner.skipSuperfluous();

    // close tag </
    if (startOfCloseTag(scanner)) {
      break;
    }
    // Assume selector
    const suggestion = suggestRule(scanner);
    if (suggestion) {
      return suggestion;
    }

    scanner.next();
  }

  return null;
};

const suggestRule = (scanner: TokenScanner): SuggestContext => {
  scanner.skipSuperfluous();

  if (scanner.current?.value === "@") {
    const declSuggestion = suggestCSSAtRule(
      scanner,
      SuggestContextKind.CSS_AT_RULE_NAME
    );

    if (declSuggestion) {
      return declSuggestion;
    }
  } else {
    // Assume selector
    const suggestion = suggestStyleRule(scanner);
    if (suggestion) {
      return suggestion;
    }
  }
};

const suggestStyleRule = (scanner: TokenScanner): SuggestContext => {
  let selectorText = "";

  while (scanner.current) {
    if (scanner.current.value === "{") {
      break;
    }

    selectorText += scanner.current.value;
    scanner.next();
  }

  if (!scanner.current) {
    return null;
  }

  scanner.next(); // eat {

  while (scanner.current) {
    const declSuggestion = suggestCSSDeclaration(scanner);
    if (declSuggestion) {
      return declSuggestion;
    }

    if (scanner.current?.value === "}") {
      scanner.next(); // eat }
      break;
    }
  }
};

const suggestCSSDeclaration = (scanner: TokenScanner): SuggestContext => {
  // only suggest declaration if on new line -- UX is wierd otherwise
  const ws = scanner.current?.value;
  scanner.skipSuperfluous();
  if (!scanner.current) {
    if (ws && /[\n\r]/.test(ws)) {
      return { kind: SuggestContextKind.CSS_DECLARATION_NAME, prefix: "" };
    }
  }

  if (scanner.current?.value === "}") {
    return null;
  }

  if (scanner.current.value === "&") {
    scanner.next(); // eat &
    return suggestStyleRule(scanner);
  } else if (scanner.current.value === "@") {
    return suggestCSSAtRule(
      scanner,
      SuggestContextKind.CSS_DECLARATION_AT_RULE
    );
  } else {
    const pos = scanner.pos;
    const current = scanner.current;
    let isDeclaration = true;
    while (scanner.current) {
      if (scanner.current.value === "{") {
        isDeclaration = false;
        break;
      } else if (scanner.current.value === ":") {
        break;
      }
      scanner.next();
    }
    scanner.pos = pos;
    scanner.current = current;
    if (isDeclaration) {
      return suggestCSSProperty(scanner);
    } else {
      return suggestStyleRule(scanner);
    }
  }
};

const suggestCSSProperty = (scanner: TokenScanner): SuggestContext => {
  let name = "";

  while (scanner.current.value !== ":") {
    name += scanner.current.value;
    scanner.next();
    scanner.skipSuperfluous();
    if (!scanner.current) {
      return { kind: SuggestContextKind.CSS_DECLARATION_NAME, prefix: name };
    }
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

  if (scanner.current?.value === "{") {
    if (prefix === "media" || prefix == "keyframes") {
      return suggestContainerAtRule(scanner);
    } else {
      return suggestStyleAtRule(scanner);
    }
  } else {
    scanner.next(); // eat ;
  }

  return null;
};

const suggestStyleAtRule = (scanner: TokenScanner): SuggestContext => {
  if (scanner.current?.value === "{") {
    scanner.next();
    while (scanner.current) {
      scanner.skipSuperfluous();
      if (String(scanner.current?.value) === "}") {
        break;
      }

      const suggestion = suggestCSSDeclaration(scanner);
      if (suggestion) {
        return suggestion;
      }
    }
  }

  return null;
};

const suggestContainerAtRule = (scanner: TokenScanner): SuggestContext => {
  if (scanner.current?.value === "{") {
    scanner.next(); // eat {
    while (scanner.current) {
      scanner.skipSuperfluous();
      if (String(scanner.current?.value) === "}") {
        scanner.next();
        break;
      }
      const suggestion = suggestRule(scanner);
      if (suggestion) {
        return suggestion;
      }
    }
  } else {
    scanner.next(); // eat ;
  }

  return null;
};

const suggestCSSDeclarationValue = (
  declarationName: string,
  scanner: TokenScanner
): SuggestContext => {
  let currentChunk = "";

  while (1) {
    scanner.skipSuperfluous();

    if (!scanner.current) {
      return {
        kind: SuggestContextKind.CSS_DECLARATION_VALUE,
        declarationName,
        declarationValuePrefix: currentChunk
      };
    }

    if (scanner.current.value === ";") {
      scanner.next(); // eat ;
      break;
    }

    currentChunk += scanner.current.value;

    if (scanner.peek()?.value === "(") {
      // take other declaration parts into consideration
      const name = currentChunk.split(" ").pop();
      scanner.next(); // eat name
      scanner.next(); // eat (
      if (!scanner.current) {
        return {
          kind: SuggestContextKind.CSS_FUNCTION,
          name,
          paramsPrefix: ""
        };
      }

      let buffer = getBuffer(scanner, scanner => scanner.current.value !== ")");

      scanner.next(); // eat )

      if (!scanner.current) {
        return {
          kind: SuggestContextKind.CSS_FUNCTION,
          name,
          paramsPrefix: buffer
        };
      }
    } else {
      scanner.next();
    }
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
