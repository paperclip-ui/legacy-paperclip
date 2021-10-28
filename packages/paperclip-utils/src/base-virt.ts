import { StringRange } from "./base-ast";

export type ExprTextSource = {
  uri: string;
  range: StringRange;
};

export type ExprSource = {
  sourceId: string;
  textSource?: ExprTextSource;
};
