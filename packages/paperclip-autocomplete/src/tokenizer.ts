import { StringScanner } from "./string-scanner";

export enum TokenKind {
  Word,
  Whitespace,
  Number,
  Char
}

export type Token = {
  value: string;
  kind: TokenKind;
  pos: number;
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
    kind: TokenKind.Whitespace
  },
  {
    regexp: /^./,
    kind: TokenKind.Char
  }
];

export class TokenScanner {
  public pos = 0;
  public current: Token;
  constructor(readonly source: Token[]) {
    this.current = this.next();
  }
  skipWhitespace() {
    if (this.current?.kind === TokenKind.Whitespace) {
      this.next();
    }
  }
  skipSuperfluous() {
    this.skipWhitespace();

    // comment
    if (this.current?.value === "/") {
      if (this.peek()?.value === "/") {
        this.next();
        while (this.current) {
          if (/[\n\r]/.test(this.current.value)) {
            this.skipSuperfluous();
            break;
          }
          this.next();
        }
      }
      if (this.peek()?.value === "*") {
        this.next();
        while (this.current) {
          if (
            String(this.current.value) === "*" &&
            this.peek()?.value === "/"
          ) {
            this.next(); // eat *
            this.next(); // eat /
            this.skipSuperfluous();
            break;
          }
          this.next();
        }
      }
    }
  }
  next() {
    if (this.pos >= this.source.length) {
      this.current = null;
      return null;
    }
    return (this.current = this.source[this.pos++]);
  }
  peek(count = 0) {
    return this.source[this.pos + count];
  }
}

export const tokenize = (source: string) => {
  const scanner = new StringScanner(source);
  const tokens: Token[] = [];

  while (!scanner.isEOF()) {
    for (const { regexp, kind } of RULES) {
      const pos = scanner.pos;
      const value = scanner.scan(regexp);

      if (value) {
        tokens.push({ value, kind, pos });
        break;
      }
    }
  }

  return new TokenScanner(tokens);
};
