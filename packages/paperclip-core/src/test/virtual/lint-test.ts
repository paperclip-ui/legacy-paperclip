import { expect } from "chai";
import { createMockEngine } from "../utils";

describe(__filename + "#", () => {
  [
    [
      `shows warning for simple style rule without target`,
      `<style>div { color2: red }</style>`,
      1
    ],
    [
      `does not display warning for style rule if applied`,
      `<style>div { color2: red }</style><div />`,
      0
    ],
    [
      `shows lint diagnostics if there's a syntax error`,
      `<style>div { bc: 2; }</style><div>`,
      1
    ],
    [
      `works for attribute equalities`,
      `<style>[href="test"] { ab: 1; }</style><div href="test" />`,
      0
    ],
    [
      `works for color props`,
      `<style>[href="test"] { color: red }</style><div href="test" />`,
      1
    ]
  ].forEach(([title, source, len]: [string, string, number]) => {
    it(title, () => {
      const engine = createMockEngine({
        "entry.pc": source
      });

      try {
        engine.open("entry.pc");
        // eslint-disable-next-line
      } catch (e) {}

      expect(engine.lint("entry.pc").length).to.eql(len);
    });
  });
});
