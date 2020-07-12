import { memoize } from "lodash";
import { CompletionItem, InsertTextFormat } from "vscode-languageserver";

export type PCCompletionItem = Omit<CompletionItem, "data"> & {
  data: {
    uri: string;
    [identifier: string]: any;
  };
};

export const RETRIGGER_COMMAND = {
  command: `editor.action.triggerSuggest`,
  title: "Autocomplete"
};

export const stringArrayToAutoCompleteItems = memoize(
  (values: string[]): CompletionItem[] =>
    values.map(value => ({
      label: value
    }))
);

export const stringArraytoSnippetStringOptions = memoize(
  (values: string[]) => `|${values.join(",")}|`
);

export const tagCompletionItem = (
  tagName: string,
  hasAttributes: boolean
): CompletionItem => {
  // let insertText = `${tagName}$0>\n</${tagName}>`;

  // if (tagName === "style") {
  //   insertText = `${tagName}>\n\t\$0\n</${tagName}>`;
  //   hasAttributes = false;
  // }

  // if (/^(span)$/.test(tagName)) {
  //   insertText = `${tagName}$1></${tagName}>`;
  // }

  // if (/^(i|b|strong)$/.test(tagName)) {
  //   insertText = `${tagName}>$0</${tagName}>`;
  // }

  // if (tagName === "import") {
  //   insertText = `${tagName} $0>`;
  //   hasAttributes = true;
  // }

  return {
    label: tagName,
    insertTextFormat: InsertTextFormat.Snippet,
    command: hasAttributes ? RETRIGGER_COMMAND : null
  };
};

export const addCompletionItemData = (
  item: CompletionItem,
  uri: string,
  data: any = {}
) => ({
  ...item,
  data: {
    ...data,
    ...(item.data || {}),
    uri
  }
});
