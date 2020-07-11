// super helpful: https://github.com/microsoft/vscode-extension-samples/blob/master/completions-sample/src/extension.ts

import * as fs from "fs";
import * as path from "path";

import {
  getSuggestionContext,
  SuggestContextKind,
  HTMLTagNameSuggestionContext,
  HTMLAttributeStringValueContext,
  HTMLAttributeNameSuggestionContext,
  CSSDeclarationValueSuggestionContext,
  CSSDeclarationSuggestionContext,
  CSSDeclarationAtRuleSuggestionContext,
  CSSDeclarationAtRuleParamsSuggestionContext,
  CSSAtRuleSuggestionContext,
  CSSVariableSuggestionContext
} from "paperclip-autocomplete";

import { ELEMENT_ATTRIBUTES, ALL_TAG_NAMES } from "./html-constants";
import { resolveAllPaperclipFiles } from "paperclip";
import {
  CSS_DECLARATION_NAMES,
  CSS_DECLARATION_VALUE_ITEMS
} from "./css-constants";
import {
  CompletionItem,
  InsertTextFormat,
  Command,
  CompletionItemKind
} from "vscode-languageserver";
import {
  stringArrayToAutoCompleteItems,
  stringArraytoSnippetStringOptions,
  addCompletionItemData,
  PCCompletionItem,
  RETRIGGER_COMMAND
} from "./utils";
import {
  CSS_DECLARATION_NAME_COMPLETION_ITEMS,
  ATTRIBUTE_NAME_COMPLETION_ITEMS,
  TAG_NAME_COMPLETION_ITEMS,
  AT_RULE_COMPLETION_ITEMS
} from "./completion-items";
import { LoadedEvent, DEFAULT_PART_ID } from "paperclip";
import { LoadedData } from "paperclip";
import { memoize } from "lodash";
import { isPaperclipFile } from "../../../client/utils";
import { Loaded } from "../../../common/notifications";

const EMPTY_ARRAY = [];

export class PCAutocomplete {
  resolveCompletionItem(item: PCCompletionItem): CompletionItem {
    return item;

    // unnecessary since commands are re-triggers
    // if (item.data.cssDeclarationName) {
    //   const name = item.data.cssDeclarationName;

    //   return {
    //     ...item,
    //     insertText: name + ": ${1"+ (CSS_DECLARATION_VALUE_ITEMS[name] ? stringArraytoSnippetStringOptions(CSS_DECLARATION_VALUE_ITEMS[name]) : ":") +"};",
    //     insertTextFormat: InsertTextFormat.Snippet
    //   }
    // }

    // if (item.data.htmlAttributeName) {
    //   const name = item.data.htmlAttributeName;

    //   if (name === "src" && item.data.tagPath?.length === 1 && item.data.tagPath[0] === "import") {
    //     return {
    //       ...item,
    //       insertText: `${name}="\${1${stringArraytoSnippetStringOptions(resolveAllPaperclipFiles(fs)(item.data.uri, true))}}"`,
    //       insertTextFormat: InsertTextFormat.Snippet
    //     }
    //   }
    // }
  }
  getSuggestions(
    uri: string,
    text: string,
    data?: LoadedData
  ): PCCompletionItem[] {
    return this.getSuggestions2(uri, text, data).map(item =>
      addCompletionItemData(item, uri)
    );
  }

  getSuggestions2(
    uri: string,
    text: string,
    data?: LoadedData
  ): CompletionItem[] {
    const context = getSuggestionContext(text);
    if (!context) {
      return [];
    }

    switch (context.kind) {
      case SuggestContextKind.HTML_TAG_NAME:
        return this._getHTMLTagNameSuggestions(context, data);
      case SuggestContextKind.HTML_ATTRIBUTE_NAME:
        return this._getAttributeNameSuggestions(context);
      case SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE:
        return this._getHTMLAttributeStringValueSuggestions(uri, context, data);
      case SuggestContextKind.CSS_DECLARATION_NAME:
        return this._getCSSDeclarationNameSuggestion(context, data);
      case SuggestContextKind.CSS_DECLARATION_AT_RULE:
        return this._getCSSDeclarationAtRuleSuggestion(context, data);
      case SuggestContextKind.CSS_AT_RULE_PARAMS:
        return this._getCSSDeclarationAtRuleParamsSuggestion(context, data);
      case SuggestContextKind.CSS_AT_RULE_NAME:
        return this._getCSSAtRuleSuggestion(context);
      case SuggestContextKind.CSS_DECLARATION_VALUE:
        return this._getCSSDeclarationValueSugestion(context, data);
      case SuggestContextKind.CSS_VARIABLE:
        return this._getCSSVariableSuggestion(data);
      case SuggestContextKind.CSS_CLASS_REFERENCE:
        return this._getCSSClassReferenceSuggestion(data);
    }
  }
  private _getHTMLTagNameSuggestions(
    context: HTMLTagNameSuggestionContext,
    data?: LoadedData
  ) {
    if (context.path.length === 1) {
      const options = [];

      if (data) {
        for (const id in data.imports) {
          if (/\.pc$/.test(id)) {
            continue;
          }
          const imp = data.imports[id];
          if (imp.components.length) {
            for (const componentId of imp.components) {
              let tagName;

              if (componentId === DEFAULT_PART_ID) {
                tagName = id;
              } else {
                tagName = `${id}.${componentId}`;
              }

              options.push({
                label: tagName,
                insertText: `${tagName} `

                // TODO - want to get around to this when we actually have options.
                // command: RETRIGGER_COMMAND
              });
            }
          }
        }
      }

      options.push(...TAG_NAME_COMPLETION_ITEMS);

      return options;
    }
    return [];
  }

  private _getCSSDeclarationAtRuleSuggestion(
    context: CSSDeclarationAtRuleSuggestionContext,
    data: LoadedData
  ) {
    return [
      {
        label: "include",
        insertText: "include ${1:};",
        insertTextFormat: InsertTextFormat.Snippet,
        command:
          data && loadedMixinsAsCompletionList(data).length
            ? RETRIGGER_COMMAND
            : null
      }
    ];
  }

  private _getCSSAtRuleSuggestion(_context: CSSAtRuleSuggestionContext) {
    return AT_RULE_COMPLETION_ITEMS;
  }

  private _getCSSDeclarationAtRuleParamsSuggestion(
    context: CSSDeclarationAtRuleParamsSuggestionContext,
    data: LoadedData
  ) {
    if (context.atRuleName === "include") {
      return loadedMixinsAsCompletionList(data);
    } else {
      return [];
    }
  }

  private _getAttributeNameSuggestions(
    context: HTMLAttributeNameSuggestionContext
  ) {
    if (context.tagPath.length === 1) {
      return ATTRIBUTE_NAME_COMPLETION_ITEMS[context.tagPath[0]] || [];
    }
    return [];
  }
  private _getHTMLAttributeStringValueSuggestions(
    uri: string,
    context: HTMLAttributeStringValueContext,
    data: LoadedData
  ) {
    if (context.tagPath.length === 1 && context.tagPath[0] === "import") {
      if (context.attributeName == "src") {
        return stringArrayToAutoCompleteItems(
          resolveAllPaperclipFiles(fs)(uri, true)
        );
      }
    }

    if (
      context.attributeName === "className" ||
      context.attributeName === "class"
    ) {
      return this._getCSSClassReferenceSuggestion(data, false);
    }
    return [];
  }

  private _getCSSDeclarationValueSugestion(
    info: CSSDeclarationValueSuggestionContext,
    data: LoadedData
  ) {
    let list = stringArrayToAutoCompleteItems(
      CSS_DECLARATION_VALUE_ITEMS[info.declarationName] || EMPTY_ARRAY
    );

    list.push(...declaredVarsToCompletionItems(data, true));

    return list;
  }

  private _getCSSVariableSuggestion(data: LoadedData) {
    return declaredVarsToCompletionItems(data);
  }

  private _getCSSClassReferenceSuggestion(
    data: LoadedData,
    includeImports: boolean = true
  ) {
    let list: CompletionItem[] = [];
    for (const className in data.exports.style.classNames) {
      list.push({
        label: className
      });
    }
    if (includeImports) {
      for (const id in data.imports) {
        if (/\//.test(id)) {
          continue;
        }

        const cx = data.imports[id].style.classNames;

        for (const className in cx) {
          const part = cx[className];
          if (!part.public) {
            continue;
          }
          list.push({
            label: `${id}.${className}`
          });
        }
      }
    }
    return list;
  }

  // TODO - possibly take evaluated CSS rule into consideration, and filter options based on sibling
  // declarations. Should be possible since virtual styles contain positions, so we just need to find on that
  // corresponds to the caret position.

  private _getCSSDeclarationNameSuggestion(
    info: CSSDeclarationSuggestionContext,
    data: LoadedData
  ) {
    let list = CSS_DECLARATION_NAME_COMPLETION_ITEMS;

    if (containsVars(data)) {
      list = list.map(item => ({ ...item, command: RETRIGGER_COMMAND }));
    }

    return list;
  }
}

const declaredVarsToCompletionItems = memoize(
  (data: LoadedData, includeVar?: boolean) => {
    const list: CompletionItem[] = [];
    const used = {};
    for (const name in data.exports.style.variables) {
      used[name] = true;
      list.push({
        label: name,
        insertText: includeVar ? `var(${name})` : name,
        detail: data.exports.style.variables[name].value
      });
    }
    for (const imp in data.imports) {
      for (const name in data.imports[imp].style.variables) {
        if (used[name]) {
          continue;
        }
        used[name] = true;
        list.push({
          label: name,
          insertText: includeVar ? `var(${name})` : name,
          detail: data.imports[imp].style.variables[name].value
        });
      }
    }

    return list;
  }
);

const containsVars = (data: LoadedData) => {
  for (const name in data.exports.style.variables) {
    return true;
  }
  for (const imp in data.imports) {
    for (const name in data.imports[imp].style.variables) {
      return true;
    }
  }
  return false;
};

const loadedMixinsAsCompletionList = memoize((data: LoadedData) => {
  const list: CompletionItem[] = [];

  for (const mixinName in data.exports.style.mixins) {
    const mixin = data.exports.style.mixins[mixinName];
    list.push({
      label: mixinName,
      detail: stringifyDeclarations(mixin.declarations)
    });
  }

  for (const importId in data.imports) {
    // is file
    if (/\//.test(importId)) {
      continue;
    }
    const imp = data.imports[importId];
    for (const mixinName in imp.style.mixins) {
      const mixin = imp.style.mixins[mixinName];
      if (!mixin.public) {
        continue;
      }
      list.push({
        label: `${importId}.${mixinName}`,
        detail: stringifyDeclarations(mixin.declarations)
      });
    }
  }

  return list;
});

const stringifyDeclarations = decl => {
  return decl
    .map(({ name, value }) => {
      return `${name}: ${value}`;
    })
    .join(";");
};
