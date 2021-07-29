/**
 * dispatched when PC source is linted and warnings are generated
 */

export class SourceLinted {
  constructor(readonly uri: string) {}
}
