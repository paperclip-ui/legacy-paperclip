export class StringScanner {
  public pos = 0;
  constructor(readonly source: string) {}
  isEOF() {
    return this.pos >= this.source.length;
  }
  curr() {
    return this.source[this.pos];
  }
  scan(regexp: RegExp) {
    const match = regexp.exec(this.source.substr(this.pos));

    if (!match) {
      return null;
    }

    const value = match[0];

    this.pos += value.length;
    return value;
  }
  forward(steps: number) {
    this.pos += steps;
  }
}
