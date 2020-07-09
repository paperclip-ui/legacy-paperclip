import { stringArrayToAutoCompleteItems, RETRIGGER_COMMAND } from "./utils";
import { CompletionItemKind, CompletionItem, InsertTextFormat } from "vscode-languageserver";
import { CSS_DECLARATION_NAMES } from "./css-constants";
import { ELEMENT_ATTRIBUTES, ALL_TAG_NAMES } from "./html-constants";



const CSS_DECLARATION_NAME_COMPLETION_ITEMS = stringArrayToAutoCompleteItems(CSS_DECLARATION_NAMES).map(({ label }): CompletionItem => ({
  label,
  kind: CompletionItemKind.Property,
  insertText: label + ": ${1:};",
  insertTextFormat: InsertTextFormat.Snippet,
  command: RETRIGGER_COMMAND,
  data: {
    cssDeclarationName: label
  }
}));

const ATTRIBUTE_NAME_COMPLETION_ITEMS = {};

for (const tagName in ELEMENT_ATTRIBUTES) {
  ATTRIBUTE_NAME_COMPLETION_ITEMS[tagName] = [];

  for (const attrName of ELEMENT_ATTRIBUTES[tagName]) {
    let item: CompletionItem = {
      label: attrName
    }

    if (tagName === "import" && attrName === "src") {
      item = {
        ...item,
        insertText: `src="\${1:}"`,
        insertTextFormat: InsertTextFormat.Snippet,
        command: RETRIGGER_COMMAND
      }
    }

    ATTRIBUTE_NAME_COMPLETION_ITEMS[tagName].push(item);
  }
}

const TAG_NAME_COMPLETION_ITEMS = [];

for (const tagName of ALL_TAG_NAMES) {
  const item: CompletionItem = {
    label: tagName,
    insertText: `${tagName} `,
    command: RETRIGGER_COMMAND
  };

  TAG_NAME_COMPLETION_ITEMS.push(item);
}


export {CSS_DECLARATION_NAME_COMPLETION_ITEMS, ATTRIBUTE_NAME_COMPLETION_ITEMS, TAG_NAME_COMPLETION_ITEMS};