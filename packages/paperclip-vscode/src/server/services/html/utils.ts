import { memoize } from "lodash";
import { CompletionItem } from "vscode-languageserver";

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
