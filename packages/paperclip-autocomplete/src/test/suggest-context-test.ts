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
        tagPath: ["ta", "a"]
      }
    ],
    [
      `<a b`,
      {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        prefix: "b",
        tagPath: ["a"]
      }
    ],
    [
      `<a b `,
      {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        prefix: "",
        tagPath: ["a"]
      }
    ],
    [
      `<a b c`,
      {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        prefix: "c",
        tagPath: ["a"]
      }
    ],
    [
      `<a b c="" `,
      {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        prefix: "",
        tagPath: ["a"]
      }
    ],
    [
      `<a b c="" d`,
      {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        prefix: "d",
        tagPath: ["a"]
      }
    ],
    [`<a b c="" d>`, null],
    [`<a b c="" d><`, { kind: SuggestContextKind.HTML_TAG_NAME, path: [] }],
    [
      `<import src="`,
      {
        kind: SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE,
        tagPath: ["import"],
        attributeName: "src",
        attributeValuePrefix: ""
      }
    ],
    [
      `<import src="  `,
      {
        kind: SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE,
        tagPath: ["import"],
        attributeName: "src",
        attributeValuePrefix: "  "
      }
    ],
    [`<import src=""`, null],
    [
      `<import src="" c="`,
      {
        kind: SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE,
        tagPath: ["import"],
        attributeName: "c",
        attributeValuePrefix: ""
      }
    ],
    [
      `<import {ab} c="`,
      {
        kind: SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE,
        tagPath: ["import"],
        attributeName: "c",
        attributeValuePrefix: ""
      }
    ],

    /* style suggestions */
    [`color: red;`, null],
    [`div { color: red; }`, null],
    [
      `<style> d { col`,
      { kind: SuggestContextKind.CSS_DECLARATION_NAME, prefix: "col" }
    ],
    [`<style> d { `, null],
    [
      `<style> d {\n`,
      { kind: SuggestContextKind.CSS_DECLARATION_NAME, prefix: "" }
    ],
    [`<style> a { } a`, null],
    [`<style> a { } b { `, null],
    [
      `<style> a { } b {\n `,
      { kind: SuggestContextKind.CSS_DECLARATION_NAME, prefix: "" }
    ],
    [
      `<style> a { } b { color: bl`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_VALUE,
        declarationName: "color",
        declarationValuePrefix: "bl"
      }
    ],
    [
      `<style> a { } b { @in`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_AT_RULE,
        prefix: "in"
      }
    ],
    [
      `<style> a { } b { @`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_AT_RULE,
        prefix: ""
      }
    ],
    [
      `<style> a { } b { @include `,
      {
        kind: SuggestContextKind.CSS_AT_RULE_PARAMS,
        atRuleName: "include",
        params: ""
      }
    ],
    [
      `<style> a { } b { @include ab c`,
      {
        kind: SuggestContextKind.CSS_AT_RULE_PARAMS,
        atRuleName: "include",
        params: "ab c"
      }
    ],
    [`<style> a { } b { @include ab c;`, null],
    [
      `<style> a { } b { @include ab c;\n`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_NAME,
        prefix: ""
      }
    ],

    // at-rules
    [
      `<style> @`,
      {
        kind: SuggestContextKind.CSS_AT_RULE_NAME,
        prefix: ""
      }
    ],
    [
      `<style> @med`,
      {
        kind: SuggestContextKind.CSS_AT_RULE_NAME,
        prefix: "med"
      }
    ],
    [
      `<style> @media `,
      {
        kind: SuggestContextKind.CSS_AT_RULE_PARAMS,
        atRuleName: "media",
        params: ""
      }
    ],
    [
      `<style> div { color: var(`,
      {
        kind: SuggestContextKind.CSS_VARIABLE,
        prefix: ""
      }
    ],
    [
      `<style> div { color: var(--`,
      {
        kind: SuggestContextKind.CSS_VARIABLE,
        prefix: "--"
      }
    ],
    [
      `<style> div { color: var(--col`,
      {
        kind: SuggestContextKind.CSS_VARIABLE,
        prefix: "--col"
      }
    ],

    // smoke test getting passed var
    [
      `<style> div { color: var(--color); display:`,
      {
        kind: SuggestContextKind.CSS_DECLARATION_VALUE,
        declarationValuePrefix: "",
        declarationName: "display"
      }
    ],

    // smoke test popping out of styles
    [
      `<style> a { } </style><a`,
      { kind: SuggestContextKind.HTML_TAG_NAME, path: ["a"] }
    ],

    // smoke test getting passed var
    [
      `<div className=">>>`,
      {
        kind: SuggestContextKind.CSS_CLASS_REFERENCE,
        prefix: ""
      }
    ],
    [
      `<div className=">>>ab`,
      {
        kind: SuggestContextKind.CSS_CLASS_REFERENCE,
        prefix: "ab"
      }
    ],
    [
      `<div controls={<`,
      {
        kind: SuggestContextKind.HTML_TAG_NAME,
        path: []
      }
    ],
    [
      `<div controls={<div`,
      {
        kind: SuggestContextKind.HTML_TAG_NAME,
        path: ["div"]
      }
    ],
    [
      `<div controls={<div a`,
      {
        kind: SuggestContextKind.HTML_ATTRIBUTE_NAME,
        tagPath: ["div"],
        prefix: "a"
      }
    ]
  ].forEach(([source, expectedContext]: [string, string]) => {
    it(`Can produce suggestion context for ${source}`, () => {
      const context = getSuggestionContext(source);
      expect(context).to.eql(expectedContext);
    });
  });
});
