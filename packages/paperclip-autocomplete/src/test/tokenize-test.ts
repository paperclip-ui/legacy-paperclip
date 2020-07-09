import { expect } from "chai";
import { tokenize } from "../tokenizer";

describe(__filename + "#", () => {
  [
    [`1234`, [{ value: "1234", kind: 0, pos: 0 }]],
    [
      `<abc />`,
      [
        { value: "<", kind: 3, pos: 0 },
        { value: "abc", kind: 0, pos: 1 },
        { value: " ", kind: 1, pos: 4 },
        { value: "/", kind: 3, pos: 5 },
        { value: ">", kind: 3, pos: 6 }
      ]
    ],
    [
      `<abc\n\rc="d" />`,
      [
        { value: "<", kind: 3, pos: 0 },
        { value: "abc", kind: 0, pos: 1 },
        { value: "\n\r", kind: 1, pos: 4 },
        { value: "c", kind: 0, pos: 6 },
        { value: "=", kind: 3, pos: 7 },
        { value: '"', kind: 3, pos: 8 },
        { value: "d", kind: 0, pos: 9 },
        { value: '"', kind: 3, pos: 10 },
        { value: " ", kind: 1, pos: 11 },
        { value: "/", kind: 3, pos: 12 },
        { value: ">", kind: 3, pos: 13 }
      ]
    ],
    [
      `: 1234.5; }`,
      [
        { value: ":", kind: 3, pos: 0 },
        { value: " ", kind: 1, pos: 1 },
        { value: "1234", kind: 0, pos: 2 },
        { value: ".", kind: 3, pos: 6 },
        { value: "5", kind: 0, pos: 7 },
        { value: ";", kind: 3, pos: 8 },
        { value: " ", kind: 1, pos: 9 },
        { value: "}", kind: 3, pos: 10 }
      ]
    ]
  ].forEach(([source, expectedTokens]: [string, string]) => {
    it(`can tokenize ${source}`, () => {
      const tokens = tokenize(source).source;
      expect(tokens).to.eql(expectedTokens);
    });
  });
});
