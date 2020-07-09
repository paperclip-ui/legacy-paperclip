import { CompletionItem } from "vscode";
import {
  getSuggestionContext,
  SuggestContextKind,
  HTMLTagNameSuggestionContext,
  HTMLAttributeStringValueContext,
  HTMLAttributeNameSuggestionContext
} from "paperclip-autocomplete";

import { ELEMENT_ATTRIBUTES, ALL_TAG_NAMES } from "./constants";
import { memoize } from "lodash";
import { InsertTextFormat } from "vscode-languageclient";

const EMPTY_ARRAY = [];

export class PCAutocomplete {
  getSuggestions(text: string): CompletionItem[] {
    const context = getSuggestionContext(text);
    if (!context) {
      return [];
    }

    switch (context.kind) {
      case SuggestContextKind.HTML_TAG_NAME:
        return this._getHTMLTagNameSuggestions(context);
      case SuggestContextKind.HTML_ATTRIBUTE_NAME:
        return this._getAttributeNameSuggestions(context);
      case SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE:
        return this._getHTMLAttributeStringSuggestions(context);
    }
  }
  private _getHTMLTagNameSuggestions(context: HTMLTagNameSuggestionContext) {
    if (context.path.length === 1) {
      return stringArrayToAutoCompleteItems(ALL_TAG_NAMES);
    }
    return [];
  }
  private _getAttributeNameSuggestions(
    context: HTMLAttributeNameSuggestionContext
  ) {
    if (context.tagPath.length === 1) {
      return [
        {
          label: "src",
          insertTextFormat: InsertTextFormat.Snippet,
          insertText: 'src="${1:source}"'
        }
      ];

      return stringArrayToAutoCompleteItems(
        ELEMENT_ATTRIBUTES[context.tagPath[0]] || EMPTY_ARRAY
      );
    }
    return [];
  }
  private _getHTMLAttributeStringSuggestions(
    context: HTMLAttributeStringValueContext
  ) {
    if (context.tagPath.length === 1 && context.tagPath[0] === "import") {
      return stringArrayToAutoCompleteItems(ELEMENT_ATTRIBUTES.import);
    }
    return [];
  }
}

const stringArrayToAutoCompleteItems = memoize(
  (values: string[]): CompletionItem[] =>
    values.map(value => ({
      label: value
    }))
);
