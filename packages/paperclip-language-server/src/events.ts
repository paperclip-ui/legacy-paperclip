/**
 * dispatched when PC source is linted and warnings are generated
 */

export class SourceLinted {
  constructor(readonly uri: string) {}
}

/**
 * dispatched when designer updates source
 */

export class SourceChanged {
  constructor(readonly uri: string, readonly content: string) {}
}
