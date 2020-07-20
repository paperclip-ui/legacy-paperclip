export enum GeneratorKind {
  Node,
  Webpack,
  React,
  TypeScript,
  Root,
  Percy
}

export type GeneratorInfo = {
  kind: GeneratorKind;

  // TODO - be more specific. Not necessary now
  params: any;
};
