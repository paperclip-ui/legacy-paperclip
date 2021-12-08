export type StringPosition = {
  pos: number;
  line: number;
  column: number;
};

export type StringRange = {
  start: StringPosition;
  end: StringPosition;
};

export type BasicRaws = {
  before: string;
  after: string;
};
