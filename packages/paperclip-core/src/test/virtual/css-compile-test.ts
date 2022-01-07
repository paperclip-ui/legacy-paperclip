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
      `._80f4925f_a._80f4925f_b._80f4925f { color:red; }`,
      false
    ],
    [
      `.a .b { color: red; }`,
      `[class]._80f4925f_a [class]._80f4925f_b { color:red; }`,
      false
    ],
    [`:global(.a) { color: red; }`, `.a { color:red; }`, false],
    [
      `:global(.a, .b) .c { color: red; }`,
      `.a [class]._80f4925f_c { color:red; } .b [class]._80f4925f_c { color:red; }`,
      false
    ],
    [
      `.c :global(.a, .b) { color: red; }`,
      `[class]._80f4925f_c .a { color:red; } [class]._80f4925f_c .b { color:red; }`,
      false
    ],
    [
      `a { b, c { d { color: red; }} }`,
      `a._80f4925f b._80f4925f d._80f4925f { color:red; } a._80f4925f c._80f4925f d._80f4925f { color:red; }`,
      false
    ],
    [
      `.c :global(.a, :global(.a1, .a2), .b) { color: red; }`,
      `[class]._80f4925f_c .a { color:red; } [class]._80f4925f_c .a1 { color:red; } [class]._80f4925f_c .a2 { color:red; } [class]._80f4925f_c .b { color:red; }`,
      false
    ],
    [
      `.c:within(.b) { color: red; }`,
      `[class]._80f4925f_b ._80f4925f_c._80f4925f { color:red; }`,
      false
    ],
    [
      `.c:within(.b, .d) { color: red; }`,
      `[class]._80f4925f_b ._80f4925f_c._80f4925f { color:red; } [class]._80f4925f_d ._80f4925f_c._80f4925f { color:red; }`,
      false
    ],
    [
      `.c:within(.b, .d) { color: red; }`,
      `[class]._80f4925f_b ._406d2856 ._80f4925f_c._80f4925f { color:red; } [class]._80f4925f_d ._406d2856 ._80f4925f_c._80f4925f { color:red; }`,
      true
    ],
    [
      `.c { color: red; }`,
      `._406d2856 [class]._80f4925f_c { color:red; }`,
      true
    ],
    [
      `&:within(.a) { color: red}`,
      `[class]._80f4925f_a ._406d2856._406d2856 { color:red; }`,
      true
    ],
    [
      `:self:within(.a) { color: red}`,
      `[class]._80f4925f_a ._406d2856._406d2856._80f4925f { color:red; }`,
      true
    ],
    // [
    //   `:within(.a):self { color: red}`,
    //   `[class]._80f4925f_a ._406d2856._406d2856._80f4925f { color:red; }`,
    //   true
    // ],
    // [
    //   `:within(:global(.a, .b)):self { color: red}`,
    //   `[class].a ._406d2856._406d2856._80f4925f { color:red; } [class].b ._406d2856._406d2856._80f4925f { color:red; }`,
    //   true
    // ],
    [
      `.a, &:within(.b) { color: red}`,
      `._406d2856 [class]._80f4925f_a { color:red; } [class]._80f4925f_b ._406d2856._406d2856 { color:red; }`,
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
      `[class]._80f4925f_a._80f4925f_b { color:blue; }`,
      false
    ],
    [
      `.a { && { &&& { color: blue; } }}`,
      `[class]._80f4925f_a[class]._80f4925f_a[class]._80f4925f_a[class]._80f4925f_a[class]._80f4925f_a[class]._80f4925f_a { color:blue; }`,
      false
    ],
    [
      `.a { & & { &.test { color: blue; } }}`,
      `[class]._80f4925f_a [class]._80f4925f_a._80f4925f_test { color:blue; }`,
      false
    ],
    [
      `&:within(.a) { && { color: blue; }}`,
      `[class]._80f4925f_a ._406d2856._406d2856._406d2856._406d2856 { color:blue; }`,
      true
    ],
    [
      `element.a { color: red; }`,
      `element._80f4925f_a._80f4925f { color:red; }`,
      false
    ],
    [`:global(element.b) { color: red; }`, `element.b { color:red; }`, false],
    [
      `a ~ b { color: red; }`,
      `a._80f4925f ~ b._80f4925f { color:red; }`,
      false
    ],
    [
      `a > b { color: red; }`,
      `a._80f4925f > b._80f4925f { color:red; }`,
      false
    ],
    [`* { color: red; }`, `._80f4925f { color:red; }`, false],
    [`:global(*) { color: red; }`, `* { color:red; }`, false],
    [`:not(a) { color: red; }`, `._80f4925f:not(a) { color:red; }`, false],
    [`a:not(a) { color: red; }`, `a:not(a)._80f4925f { color:red; }`, false],
    [
      `:not(:within(.a)) { color: red; }`,
      `:not([class]._80f4925f_a) ._80f4925f { color:red; }`,
      false
    ],
    [
      `:not(:within(.a, .b)) { color: red; }`,
      `:not([class]._80f4925f_a) ._80f4925f { color:red; } :not([class]._80f4925f_b) ._80f4925f { color:red; }`,
      false
    ],
    [
      `:not(:within(:global(.a, .b))) { color: red; }`,
      `:not(.a) ._80f4925f { color:red; } :not(.b) ._80f4925f { color:red; }`,
      false
    ],
    [
      `:within(:not(.a)) { color: red; }`,
      `._80f4925f:not(._80f4925f_a) ._80f4925f { color:red; }`,
      false
    ],
    [
      `[data-test] { color: red; }`,
      `[data-test]._80f4925f { color:red; }`,
      false
    ],
    [
      `[data-test=b] { color: red; }`,
      `[data-test=b]._80f4925f { color:red; }`,
      false
    ],
    [
      `[data-test^=b] { color: red; }`,
      `[data-test^=b]._80f4925f { color:red; }`,
      false
    ],
    [
      `[data-test~=b] { color: red; }`,
      `[data-test~=b]._80f4925f { color:red; }`,
      false
    ],
    [
      `a:nth-child(1) { color: red; }`,
      `a._80f4925f:nth-child(1) { color:red; }`,
      false
    ],
    [
      `a:nth-child(1):hover { color: red; }`,
      `a._80f4925f:nth-child(1):hover { color:red; }`,
      false
    ],
    [`#id { color: red; }`, `#id._80f4925f { color:red; }`, false],
    [`:global(#id) { color: red; }`, `#id { color:red; }`, false],
    // needs to emit 4 selectors
    [
      `&:within(a, b):within(c, d) { color: orange; }`,
      `a._80f4925f ._406d2856._406d2856 { color:orange; } b._80f4925f ._406d2856._406d2856 { color:orange; } c._80f4925f ._406d2856._406d2856 { color:orange; } d._80f4925f ._406d2856._406d2856 { color:orange; }`,
      true
    ],
    [
      `a.b.c:within(:global(d, e)) { color: orange; }`,
      `d ._406d2856 a._80f4925f_b._80f4925f_c._80f4925f { color:orange; } e ._406d2856 a._80f4925f_b._80f4925f_c._80f4925f { color:orange; }`,
      true
    ],
    [
      `&.a { color: red}`,
      `._406d2856._406d2856._80f4925f_a { color:red; }`,
      true
    ],

    [
      `:global(a, &:within(b, c, d)) { color: orange; }`,
      `._406d2856 a { color:orange; } b._80f4925f ._406d2856._406d2856 { color:orange; } c._80f4925f ._406d2856._406d2856 { color:orange; } d._80f4925f ._406d2856._406d2856 { color:orange; }`,
      true
    ],

    // https://github.com/paperclipui/paperclip/issues/547
    [
      `:self(.a) { &&& { color: red; &:checked { color: blue; }}}`,
      `._406d2856._406d2856._80f4925f_a._406d2856._406d2856._80f4925f_a._406d2856._406d2856._80f4925f_a { color:red; } ._406d2856._406d2856._80f4925f_a._406d2856._406d2856._80f4925f_a._406d2856._406d2856._80f4925f_a:checked { color:blue; }`,
      true
    ],

    // https://github.com/paperclipui/paperclip/issues/549
    [
      `:self:empty { color: red; }`,
      `._406d2856._406d2856._80f4925f:empty { color:red; }`,
      true
    ],

    // https://github.com/paperclipui/paperclip/issues/548
    [
      `:self > * { color: red; }`,
      `._406d2856._406d2856 > ._80f4925f { color:red; }`,
      true
    ],
    [`:root { color: red; }`, `._80f4925f { color:red; }`, false],
    [`:global(:root) { color: red; }`, `:root { color:red; }`, false],

    // https://github.com/paperclipui/paperclip/issues/573
    [
      `:self(.variant) { @media screen and (max-width: 400px) { color: red; }}`,
      `@media screen and (max-width: 400px) { ._406d2856._406d2856._80f4925f_variant { color:red; } }`,
      true
    ],

    // https://github.com/paperclipui/paperclip/issues/607#issuecomment-758309798
    [
      `div { :within(.a) { color: red }}`,
      `[class]._80f4925f_a div._80f4925f ._80f4925f { color:red ; }`,
      false
    ],

    // https://github.com/paperclipui/paperclip/issues/607#issuecomment-758309798
    [
      `:within(.a) { color: red }`,
      `[class]._80f4925f_a ._406d2856 ._80f4925f { color:red ; }`,
      true
    ],

    // https://github.com/paperclipui/paperclip/issues/721
    [
      `&:within(.variant) { transform: translateX(100%); &:within(.visible) { transform: translateX(0%); } }`,
      `[class]._80f4925f_variant ._406d2856._406d2856 { transform:translateX(100%); } [class]._80f4925f_variant[class]._80f4925f_visible ._406d2856._406d2856 { transform:translateX(0%); }`,
      true
    ],

    // .variant .visible
    [
      `&:within(.variant) { transform: translateX(100%); :within(.visible) { transform: translateX(0%); } }`,
      `[class]._80f4925f_variant ._406d2856._406d2856 { transform:translateX(100%); } [class]._80f4925f_variant [class]._80f4925f_visible ._406d2856._406d2856 ._80f4925f { transform:translateX(0%); }`,
      true
    ],

    [
      `&:within(.a) { transform: translateX(100%); &:within(.b) { :within(.c, .d)  { color: red; }} }`,
      `[class]._80f4925f_a ._406d2856._406d2856 { transform:translateX(100%); } [class]._80f4925f_a[class]._80f4925f_b [class]._80f4925f_c ._406d2856._406d2856 ._80f4925f { color:red; } [class]._80f4925f_a[class]._80f4925f_b [class]._80f4925f_d ._406d2856._406d2856 ._80f4925f { color:red; }`,
      true
    ],

    [
      `:within(.a) { transform: translateX(100%); &:within(.b) { color: red; } }`,
      `[class]._80f4925f_a ._406d2856 ._80f4925f { transform:translateX(100%); } [class]._80f4925f_a[class]._80f4925f_b ._406d2856 ._80f4925f { color:red; }`,
      true
    ],

    [
      `&:has(.a) { color: red; }`,
      `._406d2856._406d2856:has([class]._80f4925f_a) { color:red; }`,
      true
    ],

    [
      `&:has(:global(.a)) { color: red; }`,
      `._406d2856._406d2856:has(.a) { color:red; }`,
      true
    ],

    [
      `a:before { color: red; }`,
      `._406d2856 a._80f4925f:before { color:red; }`,
      true
    ],

    [
      `@charset "utf-8"; div { color: red; }`,
      `@charset "utf-8"; div._80f4925f { color:red; }`,
      false
    ],

    [
      `@export { :root { color: red; }}`,
      `._pub-80f4925f { color:red; }`,
      false
    ],

    [
      `@media screen { @media print { .a { color: red; }}}`,
      `@media screen { @media print { [class]._80f4925f_a { color:red; } } }`,
      false
    ],

    [`.a\\:b { color: red; }`, `[class]._80f4925f_a\\:b { color:red; }`, false]

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

      expect(text).to.eql(String(output).trim());
    });
  });
});
