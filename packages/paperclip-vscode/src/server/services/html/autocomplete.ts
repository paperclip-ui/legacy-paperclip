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
  CSSDeclarationSuggestionContext
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
  TAG_NAME_COMPLETION_ITEMS
} from "./completion-items";
import { LoadedEvent, DEFAULT_PART_ID } from "paperclip";

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
    loadEvent?: LoadedEvent
  ): PCCompletionItem[] {
    return this.getSuggestions2(uri, text, loadEvent).map(item =>
      addCompletionItemData(item, uri)
    );
  }

  getSuggestions2(
    uri: string,
    text: string,
    loadedEvent?: LoadedEvent
  ): CompletionItem[] {
    const context = getSuggestionContext(text);
    if (!context) {
      return [];
    }

    switch (context.kind) {
      case SuggestContextKind.HTML_TAG_NAME:
        return this._getHTMLTagNameSuggestions(context, loadedEvent);
      case SuggestContextKind.HTML_ATTRIBUTE_NAME:
        return this._getAttributeNameSuggestions(context);
      case SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE:
        return this._getHTMLAttributeStringValueSuggestions(uri, context);
      case SuggestContextKind.CSS_DECLARATION_NAME:
        return this._getCSSDeclarationNameSuggestion(uri, context);
      case SuggestContextKind.CSS_DECLARATION_VALUE:
        return this._getCSSDeclarationValueSugestion(uri, context);
    }
  }
  private _getHTMLTagNameSuggestions(
    context: HTMLTagNameSuggestionContext,
    loadedEvent?: LoadedEvent
  ) {
    if (context.path.length === 1) {
      const options = [];

      if (loadedEvent) {
        for (const id in loadedEvent.imports) {
          if (/\.pc$/.test(id)) {
            continue;
          }
          const imp = loadedEvent.imports[id];
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
    context: HTMLAttributeStringValueContext
  ) {
    if (context.tagPath.length === 1 && context.tagPath[0] === "import") {
      if (context.attributeName == "src") {
        return stringArrayToAutoCompleteItems(
          resolveAllPaperclipFiles(fs)(uri, true)
        );
      }
    }
    return [];
  }

  private _getCSSDeclarationValueSugestion(
    uri: string,
    info: CSSDeclarationValueSuggestionContext
  ) {
    return stringArrayToAutoCompleteItems(
      CSS_DECLARATION_VALUE_ITEMS[info.declarationName] || EMPTY_ARRAY
    );
  }

  // TODO - possibly take evaluated CSS rule into consideration, and filter options based on sibling
  // declarations. Should be possible since virtual styles contain positions, so we just need to find on that
  // corresponds to the caret position.

  private _getCSSDeclarationNameSuggestion(
    uri: string,
    info: CSSDeclarationSuggestionContext
  ) {
    return CSS_DECLARATION_NAME_COMPLETION_ITEMS;
  }
}
