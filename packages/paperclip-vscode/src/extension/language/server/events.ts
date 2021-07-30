import { ExprSource } from "paperclip-utils";

export class RevealSourceRequested {
  static TYPE = "RevealSourceRequested";
  readonly type = RevealSourceRequested.TYPE;
  constructor(readonly source: ExprSource) {}
  toJSON() {
    return { type: this.type, source: this.source };
  }
}
