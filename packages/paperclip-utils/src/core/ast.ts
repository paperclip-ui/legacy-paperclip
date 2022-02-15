import { StringRange } from "../base/ast";

export type StringLiteral = {
  id: string;
  value: string;
  range: StringRange;
};
