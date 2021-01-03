import { createMockEngine, stringifyLoadResult } from "../utils";
import { expect } from "chai";

describe(__filename + "#", () => {
  [
    // various
    [`.a { color: red; }`, `[class]._80f4925f_a { color:red; }`, false],
    [
      `.a, .b { color: red; }`,
      `[class]._80f4925f_a { color:red; } [class]._80f4925f_b { color:red; }`,
      false
    ],
    [
      `.a.b { color: red; }`,
      `[data-pc-80f4925f][class].a[class].b { color:red; }`,
      false
    ],
    [
      `.a .b { color: red; }`,
      `[class]._80f4925f_a [class]._80f4925f_b { color:red; }`,
      false
    ],
    [`:global(.a) { color: red; }`, `[class].a { color:red; }`, false],
    [
      `:global(.a, .b) .c { color: red; }`,
      `[class].a [class]._80f4925f_c { color:red; } [class].b [class]._80f4925f_c { color:red; }`,
      false
    ],
    [
      `.c :global(.a, .b) { color: red; }`,
      `[class]._80f4925f_c [class].a { color:red; } [class]._80f4925f_c [class].b { color:red; }`,
      false
    ],
    [
      `.c :global(.a, :global(.a1, .a2), .b) { color: red; }`,
      `[class]._80f4925f_c [class].a { color:red; } [class]._80f4925f_c [class].a1 { color:red; } [class]._80f4925f_c [class].a2 { color:red; } [class]._80f4925f_c [class].b { color:red; }`,
      false
    ],
    [
      `.c:within(.b) { color: red; }`,
      `[class]._80f4925f_b [data-pc-80f4925f][class].c { color:red; }`,
      false
    ],
    [
      `.c:within(.b, .d) { color: red; }`,
      `[class]._80f4925f_b [data-pc-80f4925f][class].c { color:red; } [class]._80f4925f_d [data-pc-80f4925f][class].c { color:red; }`,
      false
    ],
    [
      `.c:within(.b, .d) { color: red; }`,
      `[class]._80f4925f_b [data-pc-406d2856] [data-pc-80f4925f][class].c { color:red; } [class]._80f4925f_d [data-pc-406d2856] [data-pc-80f4925f][class].c { color:red; }`,
      true
    ],
    [
      `.c { color: red; }`,
      `[data-pc-406d2856] [class]._80f4925f_c { color:red; }`,
      true
    ],
    [
      `:within(.a) { color: red}`,
      `[class]._80f4925f_a [data-pc-406d2856] { color:red; }`,
      true
    ],
    [
      `:self:within(.a) { color: red}`,
      `[class]._80f4925f_a [data-pc-80f4925f][data-pc-406d2856] { color:red; }`,
      true
    ],
    [
      `:within(.a):self { color: red}`,
      `[class]._80f4925f_a [data-pc-80f4925f][data-pc-406d2856] { color:red; }`,
      true
    ],
    [
      `:within(:global(.a, .b)):self { color: red}`,
      `[class].a [data-pc-80f4925f][data-pc-406d2856] { color:red; } [class].b [data-pc-80f4925f][data-pc-406d2856] { color:red; }`,
      true
    ],
    [
      `.a, :within(.b) { color: red}`,
      `[data-pc-406d2856] [class]._80f4925f_a { color:red; } [class]._80f4925f_b [data-pc-406d2856] { color:red; }`,
      true
    ],
    [
      `.a { .b { color: blue; }}`,
      `[class]._80f4925f_a [class]._80f4925f_b { color:blue; }`,
      false
    ],
    [
      `.a { &--b { color: blue; }}`,
      `[class]._80f4925f_a [class]._80f4925f_b { color:blue; }`,
      false
    ],

    // nesting

    // :within
    [`:within(:not(.a)) { color: red}`, ``, true],
    [`.variant:within(div) { color: red}`, ``, true],
    [`:self:within(div) { color: red}`, ``, true],
    [`&.variant { &:within(div) { color: red }}`, ``, true],

    [`a, :within(b, c, d) { color: orange; }`, ``, true],
    [`a.b.c:within(d, e) { color: orange; }`, ``, true],

    // less likely to happen, but should still work -- needs to emit 2 selectors
    [`:within(a, b).c.d { color: orange; }`, ``, true],

    // needs to emit 4 selectors
    [`:within(a, b):within(c, d) { color: orange; }`, ``, true],
    [`a.b.c:within(:global(d, e)) { color: orange; }`, ``, true],

    // :self
    // :self()
    // :global
    [`:global(a, :within(b, c, d)) { color: orange; }`, ``, true]
    // group, selector
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
