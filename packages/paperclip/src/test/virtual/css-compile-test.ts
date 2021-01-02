import { createMockEngine, stringifyLoadResult } from "../utils";
import { expect } from "chai";

describe(__filename + "#", () => {
  [
    // basic
    [`div { color: red; }`, `div[data-pc-80f4925f] { color:red; }`, false],

    // nesting

    // :within
    [
      `:within(div) { color: red}`,
      `div[data-pc-80f4925f] { color:red; }`,
      true
    ],
    [
      `:within(:not(div)) { color: red}`,
      `div[data-pc-80f4925f] { color:red; }`,
      true
    ],
    [
      `.variant:within(div) { color: red}`,
      `div[data-pc-80f4925f] { color:red; }`,
      true
    ],
    [
      `:self:within(div) { color: red}`,
      `div[data-pc-80f4925f] { color:red; }`,
      true
    ],
    [
      `&.variant { &:within(div) { color: red }}`,
      `div[data-pc-80f4925f] { color:red; }`,
      true
    ]

    // :self
    // :self()
  ].forEach(([input, output, scoped]) => {
    it(`compiles ${input} -> ${output}`, async () => {
      let source = `<style>${input}</style>`;

      if (scoped) {
        source = `<div>${source}</div>`;
      }

      const engine = await createMockEngine({
        "/entry.pc": source
      });

      const text = stringifyLoadResult(await engine.run("/entry.pc")).match(
        /<style>(.*?)<\/style>/
      )[1];
      expect(text).to.eql(output);
    });
  });
});
