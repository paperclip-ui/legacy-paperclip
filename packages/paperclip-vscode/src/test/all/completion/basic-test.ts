import * as vscode from "vscode";
import {
  openDocument,
  clearAllText,
  typeText,
  timeout,
  testCompletion
} from "../utils";
import { FIXTURE_FILE_PATHS, FIXTURE_PCCONFIG_FILE_PATHS } from "../constants";

describe(__filename + "#", () => {
  describe("without config", () => {
    it("provides completion for tag names", async () => {
      const doc = await openDocument(FIXTURE_FILE_PATHS.helloWorldPc);
      await clearAllText(doc);
      await typeText(`<im`, doc);
      await testCompletion(doc, ["import", "div", "span"]);
    });

    it("provides completion for attributes", async () => {
      const doc = await openDocument(FIXTURE_FILE_PATHS.helloWorldPc);
      await clearAllText(doc);
      await typeText(`<import src`, doc);
      await testCompletion(doc, ["src", "as", "!onClick"]);
    });

    it("provides completion for attributes", async () => {
      const doc = await openDocument(FIXTURE_FILE_PATHS.helloWorldPc);
      await clearAllText(doc);
      await typeText(`<import src`, doc);
      await testCompletion(doc, ["src", "as", "!onClick"]);
    });

    it("Doesn't resolve any files if PC config isn't present", async () => {
      const doc = await openDocument(FIXTURE_FILE_PATHS.helloWorldPc);
      await clearAllText(doc);
      await typeText(`<import src="`, doc);
      await testCompletion(doc, []);
    });
  });

  describe("with PC Config", () => {
    it("Resolves files if PC config is present", async () => {
      const doc = await openDocument(FIXTURE_PCCONFIG_FILE_PATHS.empty);
      await clearAllText(doc);
      await typeText(`<import src="`, doc);
      await testCompletion(doc, ["./module.pc", "./dependent.pc"]);
    });
  });

  describe("CSS", () => {
    it("Shows suggestions for declaration name", async () => {
      const doc = await openDocument(FIXTURE_PCCONFIG_FILE_PATHS.empty);
      await clearAllText(doc);
      await typeText(`<style> div { col`, doc);
      await testCompletion(doc, ["color", "flex", "display"]);
    });

    describe("declaration values", async () => {
      it("Shows suggestions for display", async () => {
        const doc = await openDocument(FIXTURE_PCCONFIG_FILE_PATHS.empty);
        await clearAllText(doc);
        await typeText(`<style> div { display:`, doc);
        await testCompletion(doc, ["block", "flex", "inline-flex"]);
      });
    });
  });
});
