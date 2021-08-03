/**
 * dispatched when PC source is linted and warnings are generated
 */

import { Diagnostic } from "./error-service";

export class SourceLinted {
  static TYPE = "SourceLinted";
  readonly type = SourceLinted.TYPE;
  constructor(
    readonly uri: string,
    readonly content: string,
    readonly diagnostics: Diagnostic[]
  ) {}
  toJSON() {
    return {
      type: this.type,
      uri: this.uri,
      content: this.content,
      diagnostics: this.diagnostics
    };
  }
}
