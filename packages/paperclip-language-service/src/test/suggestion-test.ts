import { expect } from "chai";
import { createMockEngineDelegate, mockFs } from "@paperclip-ui/test-utils";
import { PaperclipLanguageService } from "../language-service";
import {
  ATTRIBUTE_NAME_COMPLETION_ITEMS,
  CSS_DECLARATION_NAME_COMPLETION_ITEMS,
  TAG_NAME_COMPLETION_ITEMS,
} from "../completion-items";
import { addCompletionItemData } from "../utils";
import { createEngineDelegate } from "@paperclip-ui/core";
import { saveTmpFixtureFiles } from "@paperclip-ui/common/lib/test-utils";

describe(__filename + "#", () => {
  [
    [
      `Can create a suggestion for an element`,
      {
        "file:///entry.pc": `
          <d
        `.trim(),
      },
      [...TAG_NAME_COMPLETION_ITEMS].map((item) =>
        addCompletionItemData(item, "file:///entry.pc")
      ),
    ],
    [
      `Can create a suggestion for an attribute name`,
      {
        "file:///entry.pc": `
          <div cla
        `.trim(),
      },
      [...ATTRIBUTE_NAME_COMPLETION_ITEMS["div"]].map((item) =>
        addCompletionItemData(item, "file:///entry.pc")
      ),
    ],
    [
      `Can create a suggestion for an attribute name`,
      {
        "file:///entry.pc": `
          <div cla
        `.trim(),
      },
      [...ATTRIBUTE_NAME_COMPLETION_ITEMS["div"]].map((item) =>
        addCompletionItemData(item, "file:///entry.pc")
      ),
    ],
    [
      `Can provide autocomplete for decl name`,
      {
        "file:///entry.pc": `
          <style>col
        `.trim(),
      },
      [...CSS_DECLARATION_NAME_COMPLETION_ITEMS].map((item) =>
        addCompletionItemData(item, "file:///entry.pc")
      ),
    ],
    [
      `Can provide autocomplete for decl value`,
      {
        "file:///entry.pc": `
          <style>color:
        `.trim(),
      },
      ["currentColor", "initial", "inherit"].map(
        getCompletionItem("file:///entry.pc")
      ),
    ],
    [
      `Can provide autocomplete for src`,
      {
        "file:///entry.pc": `
          <import src="
        `.trim(),
        "file:///test.pc": `
          abba
        `.trim(),
        "file:///package.json": JSON.stringify({}),
        "file:///paperclip.config.json": JSON.stringify({
          srcDir: ".",
        }),
      },
      ["./test.pc"].map(getCompletionItem2("file:///entry.pc")),
    ],
  ].forEach(([name, graph, expectedLinks]: any) => {
    it(name, () => {
      const engine = createMockEngineDelegate(createEngineDelegate)(graph);
      try {
        engine.open("file:///entry.pc");
      } catch (e) {}
      const languagService = new PaperclipLanguageService(
        engine,
        mockFs(graph)
      );

      expect(
        languagService.getAutoCompletionSuggestions("file:///entry.pc")
      ).to.eql(expectedLinks);
    });
  });
});

function getCompletionItem(uri: string) {
  return (insertText: string) => ({
    data: {
      uri,
    },
    insertText,
    label: insertText,
  });
}

function getCompletionItem2(uri: string) {
  return (insertText: string) => ({
    data: {
      uri,
    },
    label: insertText,
    preselect: true,
  });
}
