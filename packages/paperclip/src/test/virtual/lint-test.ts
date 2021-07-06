import { expect } from "chai";
import { createMockEngine } from "../utils";

describe(__filename + "#", () => {
  [
    [
      `shows warning for simple style rule without target`,
      `<style>div { color: red }</style>`,
      1
    ],
    [
      `does not display warning for style rule if applied`,
      `<style>div { color: red }</style><div />`,
      0
    ],
    [
      `shows lint diagnostics if there's a syntax error`,
      `<style>div { color: red }</style><div>`,
      1
    ],
    [
      `works for attribute equalities`,
      `<style>[href="test"] { color: red }</style><div href="test" />`,
      0
    ]
  ].forEach(([title, source, len]: [string, string, number]) => {
    it(title, () => {
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
