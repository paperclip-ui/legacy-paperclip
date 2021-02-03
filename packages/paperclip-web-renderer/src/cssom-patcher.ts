import { stringifyCSSRule } from "paperclip-utils";

export const patchCSSOM = (sheet: CSSStyleSheet, mutations: any[]) => {
  try {
    for (const { action } of mutations) {
      switch (action.kind) {
        case "DeleteRule": {
          sheet.deleteRule(action.index);
          break;
        }
        case "InsertRule": {
          sheet.insertRule(stringifyCSSRule(action.rule), action.index);
          break;
        }
        case "ReplaceRule": {
          sheet.deleteRule(action.index);
          sheet.insertRule(stringifyCSSRule(action.rule), action.index);
          break;
        }
      }
    }

  // bypass illegal string issues
  } catch(e) {
    console.warn(e);
  }
};
