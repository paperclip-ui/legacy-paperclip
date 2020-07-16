// super helpful: https://github.com/microsoft/vscode-extension-samples/blob/master/completions-sample/src/extension.ts

import * as fs from "fs";

import {
  getSuggestionContext,
  SuggestContextKind,
  HTMLAttributeStringValueContext,
  HTMLAttributeNameSuggestionContext,
  CSSDeclarationValueSuggestionContext,
  CSSDeclarationSuggestionContext,
  CSSDeclarationAtRuleSuggestionContext,
  CSSDeclarationAtRuleParamsSuggestionContext,
  CSSAtRuleSuggestionContext,
  CSSFunctionSuggestionContext,
  HTMLCloseTagNameSuggestionContext
} from "paperclip-autocomplete";

import { resolveAllPaperclipFiles, resolveAllAssetFiles } from "paperclip";
import { ComponentExport } from "paperclip-utils";
import { CompletionItem, InsertTextFormat } from "vscode-languageserver";
import {
  stringArrayToAutoCompleteItems,
  addCompletionItemData,
  PCCompletionItem,
  RETRIGGER_COMMAND,
  tagCompletionItem
} from "./utils";
import {
  CSS_DECLARATION_VALUE_COMPLETION_ITEMS,
  CSS_DECLARATION_NAME_COMPLETION_ITEMS,
  ATTRIBUTE_NAME_COMPLETION_ITEMS,
  TAG_NAME_COMPLETION_ITEMS,
  AT_RULE_COMPLETION_ITEMS
} from "./completion-items";
import { DEFAULT_PART_ID } from "paperclip";
import { LoadedData } from "paperclip";
import { memoize } from "lodash";

const EMPTY_ARRAY = [];

export class PCAutocomplete {
  resolveCompletionItem(item: PCCompletionItem): CompletionItem {
    return item;
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
    if (!context || !data) {
      return [];
    }

    switch (context.kind) {
      case SuggestContextKind.HTML_TAG_NAME:
        return this._getHTMLTagNameSuggestions(data);
      case SuggestContextKind.HTML_ATTRIBUTE_NAME:
        return this._getAttributeNameSuggestions(context, data);
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
      case SuggestContextKind.CSS_FUNCTION:
        return this._getCSSFunctionSuggestion(context, uri, data);
      case SuggestContextKind.CSS_CLASS_REFERENCE:
        return this._getCSSClassReferenceSuggestion(data);
      // case SuggestContextKind.HTML_CLOSE_TAG_NAME:
      //   return this._getCloseTagSuggestion(context);
    }

    return [];
  }

  // slightly buggy, so don't do for now
  private _getCloseTagSuggestion(
    context: HTMLCloseTagNameSuggestionContext
  ): CompletionItem[] {
    return [
      {
        label: `</${context.openTagPath.join(".")}>`,
        preselect: true,
        insertText: `\n\t$0\n</${context.openTagPath.join(".")}>`,
        insertTextFormat: InsertTextFormat.Snippet,
        commitCharacters: [">"]
      }
    ];
  }
  private _getHTMLTagNameSuggestions(data: LoadedData) {
    const options = [];

    for (const tagName in data.exports.components) {
      const componentInfo = data.exports.components[tagName];
      options.push(
        tagCompletionItem(
          tagName,
          Object.keys(componentInfo.properties).length > 0
        )
      );
    }

    for (const id in data.imports) {
      if (/\//.test(id)) {
        continue;
      }
      const imp = data.imports[id];
      for (const componentId in imp.components) {
        const componentInfo = imp.components[componentId];
        if (!componentInfo || !componentInfo.public) {
          continue;
        }
        let tagName;

        if (componentId === DEFAULT_PART_ID) {
          tagName = id;
        } else {
          tagName = `${id}.${componentId}`;
        }

        options.push(
          tagCompletionItem(
            tagName,
            Object.keys(componentInfo.properties).length > 0
          )
        );
      }
    }

    options.push(...TAG_NAME_COMPLETION_ITEMS);

    return options;
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
        command: loadedMixinsAsCompletionList(data).length
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

  private _getComponentPropCompletionItems(componentInfo: ComponentExport) {
    return Object.keys(componentInfo.properties).map(
      propertyName =>
        ({
          label: propertyName,

          // slightly opinionated, but okay, I think.
          insertText: /^on[A-Z]/.test(propertyName)
            ? `${propertyName}={\${1:}}`
            : propertyName,
          insertTextFormat: InsertTextFormat.Snippet
        } as CompletionItem)
    );
  }

  private _getAttributeNameSuggestions(
    context: HTMLAttributeNameSuggestionContext,
    data?: LoadedData
  ) {
    const items: CompletionItem[] = [];

    const basename = context.tagPath[0];
    let isComponent;

    if (data) {
      if (data.exports.components[basename]) {
        const componentInfo = data.exports.components[basename];
        items.push(...this._getComponentPropCompletionItems(componentInfo));
        isComponent = true;
      } else if (data.imports[basename]) {
        const componentAs = context.tagPath[1] || DEFAULT_PART_ID;

        const compInfo = data.imports[basename].components[componentAs];
        items.push(...this._getComponentPropCompletionItems(compInfo));
        isComponent = true;
      }
    }

    if (!isComponent && context.tagPath.length === 1) {
      items.push(
        ...(ATTRIBUTE_NAME_COMPLETION_ITEMS[context.tagPath[0]] || []).map(
          item => {
            if (item.label === "className" && containsClasses(data)) {
              return {
                ...item,
                command: RETRIGGER_COMMAND
              };
            }

            return item;
          }
        )
      );
    }
    // items.push({
    //   label: `></${context.tagPath.join(".")}>`,
    //   insertText: `>$0</${context.tagPath.join(".")}>`,
    //   insertTextFormat: InsertTextFormat.Snippet,
    //   commitCharacters: [">"]
    // });

    return items;
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

    if (context.attributeName === "src") {
      return stringArrayToAutoCompleteItems(
        resolveAllAssetFiles(fs)(uri, true)
      );
    }

    const attrName = context.attributeName.split(":").shift();

    if (attrName === "className" || attrName === "class") {
      return this._getCSSClassReferenceSuggestion(data, false);
    }
    return [];
  }

  private _getCSSDeclarationValueSugestion(
    info: CSSDeclarationValueSuggestionContext,
    data: LoadedData
  ) {
    // This is the easiest approach. Ignore if there's text right before cursor -- this is to prevent bad autocompletions. E.g
    // -- expanded to --var(--color)
    if (
      info.declarationValuePrefix &&
      info.declarationValuePrefix.charAt(
        info.declarationValuePrefix.length - 1
      ) !== " "
    ) {
      return [];
    }

    let list = [
      ...(CSS_DECLARATION_VALUE_COMPLETION_ITEMS[info.declarationName] ||
        EMPTY_ARRAY)
    ];

    if (
      info.declarationName === "animation" ||
      info.declarationName === "animation-name"
    ) {
      for (const name in data.exports.style.keyframes) {
        const info = data.exports.style.keyframes[name];
        list.push({
          label: info.name
        });
      }
      for (const id in data.imports) {
        if (/\//.test(id)) {
          continue;
        }
        const imp = data.imports[id];
        for (const name in imp.style.keyframes) {
          const info = imp.style.keyframes[name];
          if (!info.public) {
            continue;
          }
          list.push({
            label: `${id}.${name}`
          });
        }
      }
    }

    list.push(...declaredVarsToCompletionItems(data, true));

    return list;
  }

  private _getCSSFunctionSuggestion(
    context: CSSFunctionSuggestionContext,
    uri: string,
    data: LoadedData
  ) {
    if (context.name === "var") {
      return declaredVarsToCompletionItems(data);
    }

    if (context.name === "url") {
      return stringArrayToAutoCompleteItems(
        resolveAllAssetFiles(fs)(uri, true)
      );
    }

    return [];
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
        sortText: "zz" + name,
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
          sortText: "zz" + name,
          detail: data.imports[imp].style.variables[name].value
        });
      }
    }

    return list.sort((a, b) => (a.label > b.label ? -1 : 1));
  }
);

const containsVars = (data: LoadedData) => {
  return containsExports(data, "variables");
};

const containsClasses = (data: LoadedData) => {
  return containsExports(data, "classNames");
};

const containsKeyframes = (data: LoadedData) => {
  return containsExports(data, "keyframes");
};

const containsExports = (
  data: LoadedData,
  kind: "classNames" | "keyframes" | "variables"
) => {
  for (const name in data.exports.style[kind]) {
    return true;
  }
  for (const imp in data.imports) {
    for (const name in data.imports[imp].style[kind]) {
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
