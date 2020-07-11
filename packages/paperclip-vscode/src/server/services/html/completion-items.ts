import { stringArrayToAutoCompleteItems, RETRIGGER_COMMAND } from "./utils";
import {
  CompletionItemKind,
  CompletionItem,
  InsertTextFormat
} from "vscode-languageserver";
import {
  CSS_DECLARATION_NAMES,
  CSS_DECLARATION_VALUE_ITEMS,
  CSS_AT_RULE_NAMES
} from "./css-constants";
import { ELEMENT_ATTRIBUTES, ALL_TAG_NAMES } from "./html-constants";

const CSS_DECLARATION_NAME_COMPLETION_ITEMS = stringArrayToAutoCompleteItems(
  CSS_DECLARATION_NAMES
).map(
  ({ label }): CompletionItem => ({
    label,
    kind: CompletionItemKind.Property,
    insertText: label + ": ${1:};",
    insertTextFormat: InsertTextFormat.Snippet,
    command: CSS_DECLARATION_VALUE_ITEMS[label] ? RETRIGGER_COMMAND : null,
    data: {
      cssDeclarationName: label
    }
  })
);

const ATTRIBUTE_NAME_COMPLETION_ITEMS = {};

for (const tagName in ELEMENT_ATTRIBUTES) {
  ATTRIBUTE_NAME_COMPLETION_ITEMS[tagName] = [];

  for (const attrName of ELEMENT_ATTRIBUTES[tagName]) {
    let item: CompletionItem = {
      label: attrName
    };

    if (tagName === "import" && attrName === "src") {
      item = {
        ...item,
        insertText: `src="\${1:}"`,
        insertTextFormat: InsertTextFormat.Snippet,
        command: RETRIGGER_COMMAND
      };
    }

    ATTRIBUTE_NAME_COMPLETION_ITEMS[tagName].push(item);
  }
}

const TAG_NAME_COMPLETION_ITEMS = [];

for (const tagName of ALL_TAG_NAMES) {
  const item: CompletionItem = {
    label: tagName,
    insertText: `${tagName} `,
    command: ATTRIBUTE_NAME_COMPLETION_ITEMS[tagName].length
      ? RETRIGGER_COMMAND
      : null
  };

  TAG_NAME_COMPLETION_ITEMS.push(item);
}

const AT_RULE_COMPLETION_ITEMS = [];

for (const name of CSS_AT_RULE_NAMES) {
  AT_RULE_COMPLETION_ITEMS.push({
    label: name,
    insertText: `${name} `,
    insertTextFormat: InsertTextFormat.Snippet
  });
}

export {
  AT_RULE_COMPLETION_ITEMS,
  CSS_DECLARATION_NAME_COMPLETION_ITEMS,
  ATTRIBUTE_NAME_COMPLETION_ITEMS,
  TAG_NAME_COMPLETION_ITEMS
};
