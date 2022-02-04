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
  HTMLCloseTagNameSuggestionContext,
} from "@paperclip-ui/autocomplete";

import {
  resolveAllPaperclipFiles,
  resolveAllAssetFiles,
} from "@paperclip-ui/core";
import {
  ComponentExport,
  EvaluatedDataKind,
  LoadedPCData,
} from "@paperclip-ui/utils";
import {
  stringArrayToAutoCompleteItems,
  addCompletionItemData,
  PCCompletionItem,
  CompletionItem,
  getStyleExport,
  RETRIGGER_COMMAND,
  tagCompletionItem,
  InsertTextFormat,
} from "./utils";
import {
  CSS_DECLARATION_VALUE_COMPLETION_ITEMS,
  CSS_DECLARATION_NAME_COMPLETION_ITEMS,
  ATTRIBUTE_NAME_COMPLETION_ITEMS,
  TAG_NAME_COMPLETION_ITEMS,
  AT_RULE_COMPLETION_ITEMS,
} from "./completion-items";
import { DEFAULT_PART_ID } from "@paperclip-ui/core";
import { LoadedData } from "@paperclip-ui/core";
import { memoize } from "lodash";
import { LoadedDataDetails } from "@paperclip-ui/core/src/core/delegate";

const EMPTY_ARRAY = [];

export class AutocompleteService {
  constructor(private _fs: any = fs) {}
  resolveCompletionItem(item: PCCompletionItem): CompletionItem {
    return item;
  }

  getSuggestions(
    uri: string,
    text: string,
    data: LoadedData,
    imports: Record<string, LoadedDataDetails>
  ): PCCompletionItem[] {
    return this.getSuggestions2(uri, text, data, imports).map((item) =>
      addCompletionItemData(item, uri)
    );
  }

  private getSuggestions2(
    uri: string,
    text: string,
    data: LoadedData | null,
    imports: Record<string, LoadedDataDetails>
  ): CompletionItem[] {
    let context;

    // some lingering bugs, so try & catch them
    try {
      context = getSuggestionContext(text);
    } catch (e) {
      // more detailed when we log it out like this
      console.error(e.stack);
      throw e;
    }

    if (!context) {
      return [];
    }

    try {
      switch (context.kind) {
        case SuggestContextKind.HTML_TAG_NAME:
          return this._getHTMLTagNameSuggestions(data as LoadedPCData, imports);
        case SuggestContextKind.HTML_ATTRIBUTE_NAME:
          return this._getAttributeNameSuggestions(
            context,
            data as LoadedPCData,
            imports
          );
        case SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE:
          return this._getHTMLAttributeStringValueSuggestions(
            uri,
            context,
            data,
            imports
          );
        case SuggestContextKind.CSS_DECLARATION_NAME:
          return this._getCSSDeclarationNameSuggestion(context, data, imports);
        case SuggestContextKind.CSS_DECLARATION_AT_RULE:
          return this._getCSSDeclarationAtRuleSuggestion(
            context,
            data,
            imports
          );
        case SuggestContextKind.CSS_AT_RULE_PARAMS:
          return this._getCSSDeclarationAtRuleParamsSuggestion(
            context,
            data,
            imports
          );
        case SuggestContextKind.CSS_AT_RULE_NAME:
          return this._getCSSAtRuleSuggestion(context);
        case SuggestContextKind.CSS_DECLARATION_VALUE:
          return this._getCSSDeclarationValueSugestion(context, data, imports);
        case SuggestContextKind.CSS_FUNCTION:
          return this._getCSSFunctionSuggestion(context, uri, data, imports);
        case SuggestContextKind.CSS_CLASS_REFERENCE:
          return this._getCSSClassReferenceSuggestion(data, imports);
      }
    } catch (e) {
      console.error(e.stack);
      throw e;
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
        commitCharacters: [">"],
      },
    ];
  }
  private _getHTMLTagNameSuggestions(
    data: LoadedPCData,
    imports: Record<string, LoadedData>
  ) {
    return getHTMLTagNameSuggestions(data, imports);
  }

  private _getCSSDeclarationAtRuleSuggestion(
    _context: CSSDeclarationAtRuleSuggestionContext,
    data: LoadedData,
    imports: Record<string, LoadedData>
  ) {
    return [
      {
        label: "include",
        insertText: "include ${1:};",
        insertTextFormat: InsertTextFormat.Snippet,
        command: loadedMixinsAsCompletionList(data, imports).length
          ? RETRIGGER_COMMAND
          : null,
      },
      {
        label: "content",
        insertText: "content;",
      },
    ];
  }

  private _getCSSAtRuleSuggestion(_context: CSSAtRuleSuggestionContext) {
    return AT_RULE_COMPLETION_ITEMS;
  }

  private _getCSSDeclarationAtRuleParamsSuggestion(
    context: CSSDeclarationAtRuleParamsSuggestionContext,
    data: LoadedData,
    imports: Record<string, LoadedData>
  ) {
    if (context.atRuleName === "include") {
      return loadedMixinsAsCompletionList(data, imports);
    } else {
      return [];
    }
  }

  private _getComponentPropCompletionItems(componentInfo: ComponentExport) {
    return Object.keys(componentInfo.properties).map(
      (propertyName) =>
        ({
          label: propertyName,

          // slightly opinionated, but okay, I think.
          insertText: /^on[A-Z]/.test(propertyName)
            ? `${propertyName}={\${1:}}`
            : propertyName,
          insertTextFormat: InsertTextFormat.Snippet,
        } as CompletionItem)
    );
  }

  private _getAttributeNameSuggestions(
    context: HTMLAttributeNameSuggestionContext,
    data: LoadedPCData,
    imports: Record<string, LoadedData>
  ) {
    const items: CompletionItem[] = [];

    const basename = context.tagPath[0];
    let isComponent;

    if (data) {
      if (data.exports.components[basename]) {
        const componentInfo = data.exports.components[basename];
        items.push(...this._getComponentPropCompletionItems(componentInfo));
        isComponent = true;
      } else if (imports[basename]?.kind === EvaluatedDataKind.PC) {
        const componentAs = context.tagPath[1] || DEFAULT_PART_ID;

        const compInfo = (imports[basename] as LoadedPCData).exports.components[
          componentAs
        ];
        items.push(...this._getComponentPropCompletionItems(compInfo));
        isComponent = true;
      }
    }

    if (!isComponent && context.tagPath.length === 1) {
      items.push(
        ...(ATTRIBUTE_NAME_COMPLETION_ITEMS[context.tagPath[0]] || []).map(
          (item) => {
            if (item.label === "class" && containsClasses(data, imports)) {
              return {
                ...item,
                command: RETRIGGER_COMMAND,
              };
            }

            return item;
          }
        )
      );
    }
    return items;
  }
  private _getHTMLAttributeStringValueSuggestions(
    uri: string,
    context: HTMLAttributeStringValueContext,
    data: LoadedData,
    imports: Record<string, LoadedDataDetails>
  ) {
    if (context.tagPath.length === 1 && context.tagPath[0] === "import") {
      if (context.attributeName == "src") {
        return stringArrayToAutoCompleteItems(
          resolveAllPaperclipFiles(this._fs)(uri, true)
        );
      }
    }

    if (context.attributeName === "src") {
      return stringArrayToAutoCompleteItems(
        resolveAllAssetFiles(this._fs)(uri, true)
      );
    }

    const attrName = context.attributeName.split(":").shift();

    if (attrName === "class") {
      return this._getCSSClassReferenceSuggestion(data, imports);
    }
    return [];
  }

  private _getCSSDeclarationValueSugestion(
    info: CSSDeclarationValueSuggestionContext,
    data: LoadedData,
    imports: Record<string, LoadedData>
  ) {
    const styleExports = data
      ? data.kind === EvaluatedDataKind.PC
        ? data.exports.style
        : data.exports
      : null;

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

    const list = [
      ...(CSS_DECLARATION_VALUE_COMPLETION_ITEMS[info.declarationName] ||
        EMPTY_ARRAY),
    ];

    if (
      info.declarationName === "animation" ||
      (info.declarationName === "animation-name" && styleExports)
    ) {
      for (const name in styleExports.keyframes) {
        const info = styleExports.keyframes[name];
        list.push({
          label: info.name,
        });
      }
      for (const id in imports) {
        if (/\//.test(id)) {
          continue;
        }
        const imp = imports[id];
        const styleExport = getStyleExport(imp);
        for (const name in styleExport.keyframes) {
          const info = styleExport.keyframes[name];
          if (!info.public) {
            continue;
          }
          list.push({
            label: `${id}.${name}`,
          });
        }
      }
    }

    list.push(...declaredVarsToCompletionItems(data, imports, true));

    return list;
  }

  private _getCSSFunctionSuggestion(
    context: CSSFunctionSuggestionContext,
    uri: string,
    data: LoadedData,
    imports: Record<string, LoadedData>
  ) {
    if (context.name === "var") {
      return declaredVarsToCompletionItems(data, imports);
    }

    if (context.name === "url") {
      return stringArrayToAutoCompleteItems(
        resolveAllAssetFiles(this._fs)(uri, true)
      );
    }

    return [];
  }

  private _getCSSClassReferenceSuggestion(
    data: LoadedData,
    imports: Record<string, LoadedDataDetails>,
    includeImports = true
  ) {
    const list: CompletionItem[] = [];
    const styleExports = data
      ? data.kind === EvaluatedDataKind.PC
        ? data.exports.style
        : data.exports
      : null;

    for (const className in styleExports?.classNames) {
      list.push({
        label: className,
      });
    }
    if (includeImports) {
      for (const id in imports) {
        const details = imports[id];
        if (/\//.test(id) && !details.injectStyles) {
          continue;
        }

        const cx = getStyleExport(imports[id]).classNames;

        for (const className in cx) {
          const part = cx[className];
          if (!part.public) {
            continue;
          }

          if (details.injectStyles) {
            list.push({
              label: className,
            });
          } else {
            list.push({
              label: `${id}.${className}`,
            });
          }
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
    data: LoadedData,
    imports: Record<string, LoadedData>
  ) {
    let list = CSS_DECLARATION_NAME_COMPLETION_ITEMS;

    if (containsVars(data, imports)) {
      list = list.map((item) => ({ ...item, command: RETRIGGER_COMMAND }));
    }

    return list;
  }
}

export const getHTMLTagNameSuggestions = (
  data: LoadedPCData,
  imports: Record<string, LoadedData>
) => {
  const options = [];

  if (data) {
    for (const tagName in data.exports.components) {
      const componentInfo = data.exports.components[tagName];
      options.push(
        tagCompletionItem(
          tagName,
          Object.keys(componentInfo.properties).length > 0
        )
      );
    }

    for (const id in imports) {
      if (/\//.test(id)) {
        continue;
      }
      const imp = imports[id];

      if (imp.kind === EvaluatedDataKind.PC) {
        for (const componentId in imp.exports.components) {
          const componentInfo = imp.exports.components[componentId];
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
    }
  }

  options.push(...TAG_NAME_COMPLETION_ITEMS);

  return options;
};

const declaredVarsToCompletionItems = memoize(
  (
    data: LoadedData,
    imports: Record<string, LoadedData>,
    includeVar?: boolean
  ) => {
    const styleExports = getStyleExport(data);
    const list: CompletionItem[] = [];
    const used = {};
    for (const name in styleExports?.variables) {
      used[name] = true;
      list.push({
        label: name,
        insertText: includeVar ? `var(${name})` : name,
        sortText: "zz" + name,
        detail: styleExports.variables[name].value,
      });
    }
    for (const imp in imports) {
      const styleExports = getStyleExport(imports[imp]);
      for (const name in styleExports?.variables) {
        if (used[name]) {
          continue;
        }
        used[name] = true;
        list.push({
          label: name,
          insertText: includeVar ? `var(${name})` : name,
          sortText: "zz" + name,
          detail: styleExports.variables[name].value,
        });
      }
    }

    return list.sort((a, b) => (a.label > b.label ? -1 : 1));
  }
);

const containsVars = (
  data: LoadedData,
  imports: Record<string, LoadedData>
) => {
  return containsExports(data, imports, "variables");
};

const containsClasses = (
  data: LoadedPCData,
  imports: Record<string, LoadedData>
) => {
  return containsExports(data, imports, "classNames");
};

const containsExports = (
  data: LoadedData,
  imports: Record<string, LoadedData>,
  kind: "classNames" | "keyframes" | "variables"
) => {
  const styleExports = getStyleExport(data);

  if (styleExports)
    for (const name in styleExports[kind]) {
      return true;
    }
  for (const imp in imports) {
    const exp = getStyleExport(imports[imp]);
    if (exp)
      for (const name in exp[kind]) {
        return true;
      }
  }
  return false;
};

const loadedMixinsAsCompletionList = memoize(
  (data: LoadedData, imports: Record<string, LoadedData>) => {
    const list: CompletionItem[] = [];
    const styleExports = getStyleExport(data);

    for (const mixinName in styleExports.mixins) {
      // const mixin = data.exports.style.mixins[mixinName];
      list.push({
        label: mixinName,

        // detail: stringifyDeclarations(mixin.declarations)
      });
    }

    for (const importId in imports) {
      // is file
      if (/\//.test(importId)) {
        continue;
      }
      const imp = getStyleExport(imports[importId]);
      for (const mixinName in imp.mixins) {
        const mixin = imp.mixins[mixinName];
        if (!mixin.public) {
          continue;
        }
        list.push({
          label: `${importId}.${mixinName}`,
          // detail: stringifyDeclarations(mixin.declarations)
        });
      }
    }

    return list;
  }
);
