import { Scanner } from "./scanner";

export enum TokenKind {
  Word,
  Whitespace,
  Number,
  Char
}

export type Token = {
  value: string;
  kind: TokenKind;
};

const RULES = [
  {
    regexp: /^\w+/,
    kind: TokenKind.Word
  },
  {
    regexp: /^\d+/,
    kind: TokenKind.Number
  },
  {
    regexp: /^[\s\r\n\t]+/,
    kind: TokenKind.Whitespace,
    skip: true
  },
  {
    regexp: /^./,
    kind: TokenKind.Char
  }
];

export const tokenize = (source: string): Token[] => {
  const scanner = new Scanner(source);
  const tokens: Token[] = [];

  while (!scanner.isEOF()) {
    for (const { regexp, skip, kind } of RULES) {
      const value = scanner.scan(regexp);

      if (value) {
        if (!skip) {
          tokens.push({ value, kind });
        }
        break;
      }
    }
  }

  return tokens;
};
