export type DeclValueRoot = {
  important: boolean;
  value: RootValue;
};

export enum DeclRootValueKind {
  List = "List",
  Group = "Group",
  Value = "Value",
}

export type BaseRootValue<TKind extends DeclRootValueKind> = {
  expressionKind: TKind;
};

export type List = {
  items: ListItem[];
} & BaseRootValue<DeclRootValueKind.List>;

export type ListItem = Group | Value;

export enum ListItemKind {
  Group = "Group",
  Value = "Value",
}

export type BaseListItem<TKind extends ListItemKind> = {
  listItemKind: TKind;
};

export type Group = {
  parameters: Value[];
} & BaseListItem<ListItemKind.Group> &
  BaseRootValue<DeclRootValueKind.Group>;

export enum ValueKind {
  Dimension = "Dimension",
  Operation = "Operation",
  Number = "Number",
  String = "Str",
  Raw = "Raw",
  Hex = "Hex",
  Keyword = "Keyword",
  FunctionCall = "FunctionCall",
}

type BaseValue<TKind extends ValueKind> = {
  valueKind: TKind;
} & BaseListItem<ListItemKind.Value> &
  BaseRootValue<DeclRootValueKind.Value>;

export type Dimension = {
  value: Num;
  unit: string;
} & BaseValue<ValueKind.Dimension>;

export type Operation = {
  left: Value;
  operation: string;
  right: Value;
} & BaseValue<ValueKind.Operation>;

export type Num = {
  value: string;
} & BaseValue<ValueKind.Number>;

export type Str = {
  value: string;
} & BaseValue<ValueKind.String>;

export type Raw = {
  value: string;
} & BaseValue<ValueKind.Raw>;

export type Hex = {
  value: string;
} & BaseValue<ValueKind.Hex>;

export type Keyword = {
  value: string;
} & BaseValue<ValueKind.Keyword>;

export type FunctionCall = {
  name: string;
  parameters: List;
} & BaseValue<ValueKind.FunctionCall>;

export type Value =
  | Dimension
  | Operation
  | Num
  | Str
  | Raw
  | Hex
  | Keyword
  | FunctionCall;
export type RootValue = List | Group | Value;
