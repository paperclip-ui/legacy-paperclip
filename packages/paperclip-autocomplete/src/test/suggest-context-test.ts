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
    [
      `<style> d { `,
      { kind: SuggestContextKind.CSS_DECLARATION_NAME, prefix: "" }
    ],
    [`<style> a { } a`, null],
    [
      `<style> a { } b { `,
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

    // test popping out of styles
    [
      `<style> a { } </style><a`,
      { kind: SuggestContextKind.HTML_TAG_NAME, path: ["a"] }
    ]
  ].forEach(([source, expectedContext]: [string, string]) => {
    it(`Can product suggestion context for ${source}`, () => {
      const context = getSuggestionContext(source);
      expect(context).to.eql(expectedContext);
    });
  });
});
