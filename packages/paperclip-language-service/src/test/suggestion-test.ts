import { expect } from "chai";
import { createMockEngineDelegate } from "paperclip-test-utils";
import { PaperclipLanguageService } from "../language-service";
import { TAG_NAME_COMPLETION_ITEMS } from "../completion-items";
import { addCompletionItemData } from "../utils";

describe(__filename + "#", () => {
  [
    [
      `Can create a suggestion for a component`,
      {
        "/entry.pc": `
          <d
        `.trim()
      },
      [...TAG_NAME_COMPLETION_ITEMS].map(item =>
        addCompletionItemData(item, "/entry.pc")
      )
    ]
  ].forEach(([name, graph, expectedLinks]: any) => {
    console.log(name);
    it(name, () => {
      const engine = createMockEngineDelegate(graph);
      try {
        engine.open("/entry.pc");
      } catch (e) {}
      const languagService = new PaperclipLanguageService(engine);

      expect(languagService.getAutoCompletionSuggestions("/entry.pc")).to.eql(
        expectedLinks
      );
    });
  });
});
