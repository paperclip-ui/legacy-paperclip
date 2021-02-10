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
      `[class].a[class].b[data-pc-80f4925f] { color:red; }`,
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
      `a { b, c { d { color: red; }} }`,
      `a[data-pc-80f4925f] b[data-pc-80f4925f] d[data-pc-80f4925f] { color:red; } a[data-pc-80f4925f] c[data-pc-80f4925f] d[data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `.c :global(.a, :global(.a1, .a2), .b) { color: red; }`,
      `[class]._80f4925f_c [class].a { color:red; } [class]._80f4925f_c [class].a1 { color:red; } [class]._80f4925f_c [class].a2 { color:red; } [class]._80f4925f_c [class].b { color:red; }`,
      false
    ],
    [
      `.c:within(.b) { color: red; }`,
      `[class]._80f4925f_b [class].c[data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `.c:within(.b, .d) { color: red; }`,
      `[class]._80f4925f_b [class].c[data-pc-80f4925f] { color:red; } [class]._80f4925f_d [class].c[data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `.c:within(.b, .d) { color: red; }`,
      `[class]._80f4925f_b [data-pc-406d2856] [class].c[data-pc-80f4925f] { color:red; } [class]._80f4925f_d [data-pc-406d2856] [class].c[data-pc-80f4925f] { color:red; }`,
      true
    ],
    [
      `.c { color: red; }`,
      `[data-pc-406d2856] [class]._80f4925f_c { color:red; }`,
      true
    ],
    [
      `&:within(.a) { color: red}`,
      `[class]._80f4925f_a [data-pc-406d2856][data-pc-406d2856] { color:red; }`,
      true
    ],
    [
      `:self:within(.a) { color: red}`,
      `[class]._80f4925f_a [data-pc-406d2856][data-pc-406d2856][data-pc-80f4925f] { color:red; }`,
      true
    ],
    // [
    //   `:within(.a):self { color: red}`,
    //   `[class]._80f4925f_a [data-pc-406d2856][data-pc-406d2856][data-pc-80f4925f] { color:red; }`,
    //   true
    // ],
    // [
    //   `:within(:global(.a, .b)):self { color: red}`,
    //   `[class].a [data-pc-406d2856][data-pc-406d2856][data-pc-80f4925f] { color:red; } [class].b [data-pc-406d2856][data-pc-406d2856][data-pc-80f4925f] { color:red; }`,
    //   true
    // ],
    [
      `.a, &:within(.b) { color: red}`,
      `[data-pc-406d2856] [class]._80f4925f_a { color:red; } [class]._80f4925f_b [data-pc-406d2856][data-pc-406d2856] { color:red; }`,
      true
    ],
    [
      `.a { .b { color: blue; }}`,
      `[class]._80f4925f_a [class]._80f4925f_b { color:blue; }`,
      false
    ],
    [
      `.a { &--b { color: blue; }}`,
      `[class]._80f4925f_a--b { color:blue; }`,
      false
    ],
    [
      `.a { &.b { color: blue; }}`,
      `[class]._80f4925f_a[class].b { color:blue; }`,
      false
    ],
    [
      `.a { && { &&& { color: blue; } }}`,
      `[class]._80f4925f_a[class]._80f4925f_a[class]._80f4925f_a[class]._80f4925f_a[class]._80f4925f_a[class]._80f4925f_a { color:blue; }`,
      false
    ],
    [
      `.a { & & { &.test { color: blue; } }}`,
      `[class]._80f4925f_a [class]._80f4925f_a[class].test { color:blue; }`,
      false
    ],
    [
      `&:within(.a) { && { color: blue; }}`,
      `[class]._80f4925f_a [data-pc-406d2856][data-pc-406d2856][data-pc-406d2856][data-pc-406d2856] { color:blue; }`,
      true
    ],
    [
      `element.a { color: red; }`,
      `element[class].a[data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `:global(element.b) { color: red; }`,
      `element[class].b { color:red; }`,
      false
    ],
    [
      `a ~ b { color: red; }`,
      `a[data-pc-80f4925f] ~ b[data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `a > b { color: red; }`,
      `a[data-pc-80f4925f] > b[data-pc-80f4925f] { color:red; }`,
      false
    ],
    [`* { color: red; }`, `[data-pc-80f4925f] { color:red; }`, false],
    [`:global(*) { color: red; }`, `* { color:red; }`, false],
    [
      `:not(a) { color: red; }`,
      `[data-pc-80f4925f]:not(a) { color:red; }`,
      false
    ],
    [
      `a:not(a) { color: red; }`,
      `a:not(a)[data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `:not(:within(.a)) { color: red; }`,
      `:not([class]._80f4925f_a) [data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `:not(:within(.a, .b)) { color: red; }`,
      `:not([class]._80f4925f_a) [data-pc-80f4925f] { color:red; } :not([class]._80f4925f_b) [data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `:not(:within(:global(.a, .b))) { color: red; }`,
      `:not([class].a) [data-pc-80f4925f] { color:red; } :not([class].b) [data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `:within(:not(.a)) { color: red; }`,
      `[data-pc-80f4925f]:not([class].a) [data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `[data-test] { color: red; }`,
      `[data-test][data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `[data-test=b] { color: red; }`,
      `[data-test=b][data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `[data-test^=b] { color: red; }`,
      `[data-test^=b][data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `[data-test~=b] { color: red; }`,
      `[data-test~=b][data-pc-80f4925f] { color:red; }`,
      false
    ],
    [
      `a:nth-child(1) { color: red; }`,
      `a:nth-child(1)[data-pc-80f4925f] { color:red; }`,
      false
    ],
    [`#id { color: red; }`, `#id[data-pc-80f4925f] { color:red; }`, false],
    [`:global(#id) { color: red; }`, `#id { color:red; }`, false],
    // needs to emit 4 selectors
    [
      `&:within(a, b):within(c, d) { color: orange; }`,
      `a[data-pc-80f4925f] [data-pc-406d2856][data-pc-406d2856] { color:orange; } b[data-pc-80f4925f] [data-pc-406d2856][data-pc-406d2856] { color:orange; } c[data-pc-80f4925f] [data-pc-406d2856][data-pc-406d2856] { color:orange; } d[data-pc-80f4925f] [data-pc-406d2856][data-pc-406d2856] { color:orange; }`,
      true
    ],
    [
      `a.b.c:within(:global(d, e)) { color: orange; }`,
      `d [data-pc-406d2856] a[class].b[class].c[data-pc-80f4925f] { color:orange; } e [data-pc-406d2856] a[class].b[class].c[data-pc-80f4925f] { color:orange; }`,
      true
    ],
    [
      `&.a { color: red}`,
      `[data-pc-406d2856][data-pc-406d2856][class].a { color:red; }`,
      true
    ],

    [
      `:global(a, &:within(b, c, d)) { color: orange; }`,
      `[data-pc-406d2856] a { color:orange; } b[data-pc-80f4925f] [data-pc-406d2856][data-pc-406d2856] { color:orange; } c[data-pc-80f4925f] [data-pc-406d2856][data-pc-406d2856] { color:orange; } d[data-pc-80f4925f] [data-pc-406d2856][data-pc-406d2856] { color:orange; }`,
      true
    ],

    // https://github.com/crcn/paperclip/issues/547
    [
      `:self(.a) { &&& { color: red; &:checked { color: blue; }}}`,
      `[data-pc-406d2856][data-pc-406d2856][class].a[data-pc-406d2856][data-pc-406d2856][class].a[data-pc-406d2856][data-pc-406d2856][class].a { color:red; } [data-pc-406d2856][data-pc-406d2856][class].a[data-pc-406d2856][data-pc-406d2856][class].a[data-pc-406d2856][data-pc-406d2856][class].a:checked { color:blue; }`,
      true
    ],

    // https://github.com/crcn/paperclip/issues/549
    [
      `:self:empty { color: red; }`,
      `[data-pc-406d2856][data-pc-406d2856]:empty[data-pc-80f4925f] { color:red; }`,
      true
    ],

    // https://github.com/crcn/paperclip/issues/548
    [
      `:self > * { color: red; }`,
      `[data-pc-406d2856][data-pc-406d2856] > [data-pc-80f4925f] { color:red; }`,
      true
    ],
    [`:root { color: red; }`, `[data-pc-80f4925f] { color:red; }`, false],
    [`:global(:root) { color: red; }`, `:root { color:red; }`, false],

    // https://github.com/crcn/paperclip/issues/573
    [
      `:self(.variant) { @media screen and (max-width: 400px) { color: red; }}`,
      `@media screen and (max-width: 400px) { [data-pc-406d2856][data-pc-406d2856][class].variant { color:red; } }`,
      true
    ],

    // https://github.com/crcn/paperclip/issues/607#issuecomment-758309798
    [
      `div { :within(.a) { color: red }}`,
      `[class]._80f4925f_a div[data-pc-80f4925f] [data-pc-80f4925f] { color:red ; }`,
      false
    ],

    // https://github.com/crcn/paperclip/issues/607#issuecomment-758309798
    [
      `:within(.a) { color: red }`,
      `[class]._80f4925f_a [data-pc-406d2856] [data-pc-80f4925f] { color:red ; }`,
      true
    ],

    // https://github.com/crcn/paperclip/issues/721
    [
      `&:within(.variant) { transform: translateX(100%); &:within(.visible) { transform: translateX(0%); } }`,
      `[class]._80f4925f_variant [data-pc-406d2856][data-pc-406d2856] { transform:translateX(100%); } [class]._80f4925f_variant[class]._80f4925f_visible [data-pc-406d2856][data-pc-406d2856] { transform:translateX(0%); }`,
      true
    ],

    // .variant .visible
    [
      `&:within(.variant) { transform: translateX(100%); :within(.visible) { transform: translateX(0%); } }`,
      `[class]._80f4925f_variant [data-pc-406d2856][data-pc-406d2856] { transform:translateX(100%); } [class]._80f4925f_variant [class]._80f4925f_visible [data-pc-406d2856][data-pc-406d2856] [data-pc-80f4925f] { transform:translateX(0%); }`,
      true
    ],

    [
      `&:within(.a) { transform: translateX(100%); &:within(.b) { :within(.c, .d)  { color: red; }} }`,
      `[class]._80f4925f_a [data-pc-406d2856][data-pc-406d2856] { transform:translateX(100%); } [class]._80f4925f_a[class]._80f4925f_b [class]._80f4925f_c [data-pc-406d2856][data-pc-406d2856] [data-pc-80f4925f] { color:red; } [class]._80f4925f_a[class]._80f4925f_b [class]._80f4925f_d [data-pc-406d2856][data-pc-406d2856] [data-pc-80f4925f] { color:red; }`,
      true
    ],

    [
      `:within(.a) { transform: translateX(100%); &:within(.b) { color: red; } }`,
      `[class]._80f4925f_a [data-pc-406d2856] [data-pc-80f4925f] { transform:translateX(100%); } [class]._80f4925f_a[class]._80f4925f_b [data-pc-406d2856] [data-pc-80f4925f] { color:red; }`,
      true
    ],


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

      const text = stringifyLoadResult(await engine.open("/entry.pc")).match(
        /<style>(.*?)<\/style>/
      )[1];
      expect(text).to.eql(output);
    });
  });
});
