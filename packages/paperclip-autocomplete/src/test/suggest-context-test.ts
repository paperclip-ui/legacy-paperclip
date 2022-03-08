import { expect } from "chai";
import { SuggestContextKind, getSuggestionContext } from "../suggest-context";

describe(__filename, () => {
  [
    /* HTML suggestions */

    [`<`, { kind: SuggestContextKind.HTML_TAG_NAME, path: [] }],
    [`<ta`, { kind: SuggestContextKind.HTML_TAG_NAME, path: ["ta"] }],
    [`<ta.`, { kind: SuggestContextKind.HTML_TAG_NAME, path: ["ta", ""] }],
    [`<ta.a`, { kind: SuggestContextKind.HTML_TAG_NAME, path: ["ta", "a"] }],
    [
      `<ta.a   `,
      {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        prefix: "",
        tagPath: ["ta", "a"],
      },
    ],
    [
      `<a b`,
      {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        prefix: "b",
        tagPath: ["a"],
      },
    ],
    [
      `<a b `,
      {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        prefix: "",
        tagPath: ["a"],
      },
    ],
    [
      `<a b c`,
      {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        prefix: "c",
        tagPath: ["a"],
      },
    ],
    [
      `<a b c="" `,
      {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        prefix: "",
        tagPath: ["a"],
      },
    ],
    [
      `<a b c="" d`,
      {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        prefix: "d",
        tagPath: ["a"],
      },
    ],
    [
      `<a b c="" d>`,
      { kind: SuggestContextKind.HTML_CLOSE_TAG_NAME, openTagPath: ["a"] },
    ],
    [`<a b c="" d><`, { kind: SuggestContextKind.HTML_TAG_NAME, path: [] }],
    [
      `<import src="`,
      {
        kind: SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE,
        tagPath: ["import"],
        attributeName: "src",
        attributeValuePrefix: "",
      },
    ],
    [
      `<div class="a b`,
      {
        kind: SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE,
        tagPath: ["div"],
        attributeName: "class",
        attributeValuePrefix: "a b",
      },
    ],
    [
      `<import src="  `,
      {
        kind: SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE,
        tagPath: ["import"],
        attributeName: "src",
        attributeValuePrefix: "  ",
      },
    ],
    [`<import src=""`, null],
    [
      `<import src="" c="`,
      {
        kind: SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE,
        tagPath: ["import"],
        attributeName: "c",
        attributeValuePrefix: "",
      },
    ],
    [
      `<import {ab} c="`,
      {
        kind: SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE,
        tagPath: ["import"],
        attributeName: "c",
        attributeValuePrefix: "",
      },
    ],

    /* style suggestions */
    [`color: red;`, null],
    [`div { color: red; }`, null],
    [
      `<style> d { col`,
      { kind: SuggestContextKind.CSS_DECLARATION_NAME, prefix: "col" },
    ],
    // [`<style> d { `, null],
    [
      `<style> d {\n`,
      { kind: SuggestContextKind.CSS_DECLARATION_NAME, prefix: "" },
    ],
    // [`<style> a { } a`, null],
    // [`<style> a { } b { `, null],
    [
      `<style> a { } b {\n `,
      { kind: SuggestContextKind.CSS_DECLARATION_NAME, prefix: "" },
    ],
    [
      `<style> a { } b { color: bl`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_VALUE,
        declarationName: "color",
        declarationValuePrefix: " bl",
      },
    ],
    [
      `<style> a { } b { white-space: `,
      {
        kind: SuggestContextKind.CSS_DECLARATION_VALUE,
        declarationName: "white-space",
        declarationValuePrefix: " ",
      },
    ],
    [
      `<style> a { } b { @in`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_AT_RULE,
        prefix: "in",
      },
    ],
    [
      `<style> a { } b { @in`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_AT_RULE,
        prefix: "in",
      },
    ],
    [
      `<style>  @media screen and (max-width: 500px) {
        .Color {`,
      null,
    ],
    [`<style> .Color { & .value `, null],
    [
      `<style> a { } b { @include `,
      {
        kind: SuggestContextKind.CSS_AT_RULE_PARAMS,
        atRuleName: "include",
        params: "",
      },
    ],
    [
      `<style> a { } b { @include ab c`,
      {
        kind: SuggestContextKind.CSS_AT_RULE_PARAMS,
        atRuleName: "include",
        params: "ab c",
      },
    ],
    // [`<style> a { } b { @include ab c;`, null],
    [
      `<style> a { } b { @include ab c;\n`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_NAME,
        prefix: "",
      },
    ],

    // at-rules
    [
      `<style> @`,
      {
        kind: SuggestContextKind.CSS_AT_RULE_NAME,
        prefix: "",
      },
    ],
    [
      `<style> @med`,
      {
        kind: SuggestContextKind.CSS_AT_RULE_NAME,
        prefix: "med",
      },
    ],
    [
      `<style> @media `,
      {
        kind: SuggestContextKind.CSS_AT_RULE_PARAMS,
        atRuleName: "media",
        params: "",
      },
    ],
    [
      `<style> div { color: var(`,
      {
        kind: SuggestContextKind.CSS_FUNCTION,
        name: "var",
        paramsPrefix: "",
      },
    ],
    [
      `<style> div { color: var(--`,
      {
        kind: SuggestContextKind.CSS_FUNCTION,
        name: "var",
        paramsPrefix: "--",
      },
    ],
    [
      `<style> div { color: var(--col`,
      {
        kind: SuggestContextKind.CSS_FUNCTION,
        name: "var",
        paramsPrefix: "--col",
      },
    ],
    [
      `<style> .div { background: --`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_VALUE,
        declarationValuePrefix: " --",
        declarationName: "background",
      },
    ],
    [
      `<style> .div { filter: drop-shadow(10 10 10 10) `,
      {
        kind: SuggestContextKind.CSS_DECLARATION_VALUE,
        declarationValuePrefix: " drop-shadowdrop-shadow(10 10 10 10)  ",
        declarationName: "filter",
      },
    ],

    // smoke test getting passed var
    [
      `<style> div { color: var(--color); display:`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_VALUE,
        declarationValuePrefix: "",
        declarationName: "display",
      },
    ],

    // smoke test popping out of styles
    [
      `<style></style><a`,
      { kind: SuggestContextKind.HTML_TAG_NAME, path: ["a"] },
    ],
    [
      `<style> a { } </style><a`,
      { kind: SuggestContextKind.HTML_TAG_NAME, path: ["a"] },
    ],

    // smoke test getting passed var
    [
      `<div className="$`,
      {
        kind: SuggestContextKind.CSS_CLASS_REFERENCE,
        prefix: "",
      },
    ],
    [
      `<div className="$ab`,
      {
        kind: SuggestContextKind.CSS_CLASS_REFERENCE,
        prefix: "ab",
      },
    ],
    [
      `<div controls={<`,
      {
        kind: SuggestContextKind.HTML_TAG_NAME,
        path: [],
      },
    ],
    [
      `<div controls={<div`,
      {
        kind: SuggestContextKind.HTML_TAG_NAME,
        path: ["div"],
      },
    ],
    [
      `<div controls={<div a`,
      {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        tagPath: ["div"],
        prefix: "a",
      },
    ],
    [
      `<div>`,
      {
        kind: SuggestContextKind.HTML_CLOSE_TAG_NAME,
        openTagPath: ["div"],
      },
    ],
    [
      `<div><span>`,
      {
        kind: SuggestContextKind.HTML_CLOSE_TAG_NAME,
        openTagPath: ["span"],
      },
    ],
    [
      `<div><span></span>`,
      {
        kind: SuggestContextKind.HTML_CLOSE_TAG_NAME,
        openTagPath: ["div"],
      },
    ],
    [
      `<div><span></span><b>`,
      {
        kind: SuggestContextKind.HTML_CLOSE_TAG_NAME,
        openTagPath: ["b"],
      },
    ],
    [
      `<div>ffdfd dsd<span>{cffd }</span><b>`,
      {
        kind: SuggestContextKind.HTML_CLOSE_TAG_NAME,
        openTagPath: ["b"],
      },
    ],
    [
      `<div><import />`,
      {
        kind: SuggestContextKind.HTML_CLOSE_TAG_NAME,
        openTagPath: ["div"],
      },
    ],
    [
      `<style>
      @media {
      }
    </style><`,
      {
        kind: SuggestContextKind.HTML_TAG_NAME,
        path: [],
      },
    ],
    [
      `
      <style>
        @media {
          .Color {
          }
        }
      </style>
      <div style="background: var({b})"></div><`,
      {
        kind: SuggestContextKind.HTML_TAG_NAME,
        path: [],
      },
    ],
    [
      `
      <style>

      @mixin col {
        a: b;
      }
        .Color {
          a: b;  
        }
      
      </style>
      
      <div style="background: var({varName})">

      </div><`,
      {
        kind: SuggestContextKind.HTML_TAG_NAME,
        path: [],
      },
    ],
    [
      `
      <style>
      .button {
        /* comment */
        &-negative {
        }
        
        // comment
        /* comment */

        &-negative {
        }
      }
      </style><`,
      {
        kind: SuggestContextKind.HTML_TAG_NAME,
        path: [],
      },
    ],
    [
      `
      <style>
        .a {
          .b {
            `,
      {
        kind: SuggestContextKind.CSS_DECLARATION_NAME,
        prefix: "",
      },
    ],
    [
      `<import src="./styles/global.pc" />
      <import as="ListItem" src="./item.pc" />
      <import as="Controls" src="./controls.pc" />
      <import as="Learn" src="./learn.pc" />
      
      <style>
        /* `,

      null,
    ],
    [`<style> @export { `, null],
    [
      `<style> @export { a`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_NAME,
        prefix: "a",
      },
    ],
    [
      `<style> @export { a {\n`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_NAME,
        prefix: "",
      },
    ],
    [
      `<style>@font-face {\n`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_NAME,
        prefix: "",
      },
    ],
    [
      `<style>
        .a {
          :global(b) {

          }
        }
      </style>
      
      <div {title?}>
      
      </div>
      <`,
      {
        kind: SuggestContextKind.HTML_TAG_NAME,
        path: [],
      },
    ],
    [
      `<style>
        div {
          @m`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_AT_RULE,
        prefix: "m",
      },
    ],
    [
      `<style>
        div {
          @media screen {\n`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_NAME,
        prefix: "",
      },
    ],
    [`<style>\n`, null],
  ].forEach(([source, expectedContext]: [string, string]) => {
    it(`Can produce suggestion context for ${source}`, () => {
      const context = getSuggestionContext(source);
      expect(context).to.eql(expectedContext);
    });
  });
});
