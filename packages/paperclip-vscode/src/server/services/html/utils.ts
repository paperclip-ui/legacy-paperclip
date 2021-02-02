import { memoize } from "lodash";
import { EvaluatedDataKind, LoadedData } from "paperclip-utils";
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
    values.sort().map((value, i) => ({
      label: String(value),

      // ensures that completion list is always scrolled at the top
      preselect: i === 0
    }))
);

export const getStyleExport = (data: LoadedData) => data.kind === EvaluatedDataKind.PC ? data.exports.style : data.exports;


export const stringArraytoSnippetStringOptions = memoize(
  (values: string[]) => `|${values.join(",")}|`
);

export const tagCompletionItem = (
  tagName: string,
  hasAttributes: boolean
): CompletionItem => {
  let insertText = tagName;

  if (tagName === "import") {
    insertText = `${tagName} src="$1" as="$2" />`;
    hasAttributes = true;
  }

  return {
    label: tagName,
    insertText,
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
