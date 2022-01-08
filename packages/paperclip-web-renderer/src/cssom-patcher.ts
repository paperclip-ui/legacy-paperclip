import { stringifyCSSRule } from "@paperclip-ui/utils";

export const patchCSSOM = (
  sheet: CSSStyleSheet,
  mutations: any[],
  resolveUrl: any
) => {
  for (const { action } of mutations) {
    switch (action.kind) {
      case "DeleteRule": {
        sheet.deleteRule(action.index);
        break;
      }
      case "InsertRule": {
        try {
          sheet.insertRule(
            stringifyCSSRule(action.rule, { resolveUrl }),
            action.index
          );
        } catch (e) {
          // insert some filler to maintain sync
          sheet.insertRule(".nil {}", action.index);
          console.warn(e);
        }
        break;
      }
      case "ReplaceRule": {
        sheet.deleteRule(action.index);
        // defensive against cases where user writes bad selector code that is valid in PC
        try {
          sheet.insertRule(
            stringifyCSSRule(action.rule, { resolveUrl }),
            action.index
          );
        } catch (e) {
          // insert some filler to maintain sync
          sheet.insertRule(".nil {}", action.index);
          console.warn(e);
        }
        break;
      }
    }
  }
};
