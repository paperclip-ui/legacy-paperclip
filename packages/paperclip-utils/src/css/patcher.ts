export const patchCSSSheet = (sheet: any, mutations: any[]) => {
  let newSheet = sheet;
  for (const mutation of mutations) {
    switch (mutation.action.kind) {
      case "DeleteRule": {
        const rules = [
          ...newSheet.rules.slice(0, mutation.action.index),
          ...newSheet.rules.slice(mutation.action.index + 1)
        ];

        newSheet = { ...newSheet, rules };
        break;
      }
      case "InsertRule": {
        const rules = [
          ...newSheet.rules.slice(0, mutation.action.index),
          mutation.action.rule,
          ...newSheet.rules.slice(mutation.action.index)
        ];

        newSheet = { ...newSheet, rules };
        break;
      }
      case "ReplaceRule": {
        const rules = [
          ...newSheet.rules.slice(0, mutation.action.index),
          mutation.action.rule,
          ...newSheet.rules.slice(mutation.action.index + 1)
        ];
        newSheet = { ...newSheet, rules };
        break;
      }
    }
  }
  return newSheet;
};
