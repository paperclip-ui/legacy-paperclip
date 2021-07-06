import { expect } from "chai";
import { createMockEngine } from "../utils";

describe(__filename + "#", () => {
  [
    [`<style>div { color: red }</style>`, 1],
    [`<style>div { color: red }</style><div />`, 0],
    [`<style>div { color: red }</style><div>`, 1]
  ].forEach(([source, len]: [string, string]) => {
    it(`Can lint ${source}`, () => {
      const engine = createMockEngine({
        "entry.pc": source
      });

      try {
        engine.open("entry.pc");
      } catch (e) {}

      expect(engine.lint("entry.pc").length).to.eql(len);
    });
  });
});
