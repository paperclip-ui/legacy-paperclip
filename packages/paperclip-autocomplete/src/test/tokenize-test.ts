import { expect } from "chai";
import { tokenize } from "../tokenizer";

describe(__filename + "#", () => {
  [
    [`1234`, [{ value: "1234", kind: 0 }]],
    [
      `<abc />`,
      [
        { value: "<", kind: 3 },
        { value: "abc", kind: 0 },
        { value: "/", kind: 3 },
        { value: ">", kind: 3 }
      ]
    ],
    [
      `<abc\n\rc="d" />`,
      [
        { value: "<", kind: 3 },
        { value: "abc", kind: 0 },
        { value: "c", kind: 0 },
        { value: "=", kind: 3 },
        { value: '"', kind: 3 },
        { value: "d", kind: 0 },
        { value: '"', kind: 3 },
        { value: "/", kind: 3 },
        { value: ">", kind: 3 }
      ]
    ],
    [
      `: 1234.5; }`,
      [
        { value: ":", kind: 3 },
        { value: "1234", kind: 0 },
        { value: ".", kind: 3 },
        { value: "5", kind: 0 },
        { value: ";", kind: 3 },
        { value: "}", kind: 3 }
      ]
    ]
  ].forEach(([source, expectedTokens]: [string, string]) => {
    it(`can tokenize ${source}`, () => {
      const tokens = tokenize(source);
      expect(tokens).to.eql(expectedTokens);
    });
  });
});
