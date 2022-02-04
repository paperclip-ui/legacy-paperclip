import { memoize } from "lodash";
import { EvaluatedDataKind, LoadedData } from "@paperclip-ui/utils";

export enum CompletionItemKind {
  Text = 1,
  Method = 2,
  Function = 3,
  Constructor = 4,
  Field = 5,
  Variable = 6,
  Class = 7,
  Interface = 8,
  Module = 9,
  Property = 10,
  Unit = 11,
  Value = 12,
  Enum = 13,
  Keyword = 14,
  Snippet = 15,
  Color = 16,
  File = 17,
  Reference = 18,
  Folder = 19,
  EnumMember = 20,
  Constant = 21,
  Struct = 22,
  Event = 23,
  Operator = 24,
  TypeParameter = 25,
}

export enum InsertTextFormat {
  PlainText = 1,
  Snippet = 2,
}

type Command = {
  command: string;
  title: string;
};
/**
 * A completion item represents a text snippet that is
 * proposed to complete text that is being typed.
 */
export interface CompletionItem {
  label: string;
  kind?: CompletionItemKind;
  detail?: string;
  documentation?: string;
  deprecated?: boolean;
  preselect?: boolean;
  sortText?: string;
  filterText?: string;
  insertText?: string;
  insertTextFormat?: InsertTextFormat;
  commitCharacters?: string[];
  command?: Command;
  data?: any;
}

export type PCCompletionItem = Omit<CompletionItem, "data"> & {
  data: {
    uri: string;
    [identifier: string]: any;
  };
};

export const RETRIGGER_COMMAND = {
  command: `editor.action.triggerSuggest`,
  title: "Autocomplete",
};

export const stringArrayToAutoCompleteItems = memoize(
  (values: string[]): CompletionItem[] =>
    values.sort().map((value, i) => ({
      label: String(value),

      // ensures that completion list is always scrolled at the top
      preselect: i === 0,
    }))
);

export const getStyleExport = (data: LoadedData) =>
  data
    ? data.kind === EvaluatedDataKind.PC
      ? data.exports.style
      : data.exports
    : null;

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
    command: hasAttributes ? RETRIGGER_COMMAND : null,
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
    uri,
  },
});
