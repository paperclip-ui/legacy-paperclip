import { VirtRule } from "./virt";

/*

import { ExprTextSource } from "./base-virt";
import { VirtScriptObject } from "./js-virt";
import { VirtualElementSourceInfo, VirtualNode } from "./virt";

export enum ActionKind {
  ReplaceNode = "ReplaceNode",
  InsertChild = "InsertChild",
  DeleteChild = "DeleteChild",
  SetAttribute = "SetAttribute",
  SetElementSourceInfo = "SetElementSourceInfo",
  SetAnnotations = "SetAnnotations",
  SourceUriChanged = "SourceUriChanged",
  SetText = "SetText",
  RemoveAttribute = "RemoveAttribute"
}

export type BaseAction<TKind extends ActionKind> = {
  kind: TKind;
};

export type ReplaceNode = {
  replacement: VirtualNode;
} & BaseAction<ActionKind.ReplaceNode>;
export type InsertChild = {
  child: VirtualNode;
  index: number;
} & BaseAction<ActionKind.InsertChild>;
export type DeleteChild = {
  index: number;
} & BaseAction<ActionKind.DeleteChild>;
export type SetAttribute = {
  name: string;
  value?: string;
} & BaseAction<ActionKind.SetAttribute>;
export type SetElementSourceInfo = {
  value: VirtualElementSourceInfo;
} & BaseAction<ActionKind.SetElementSourceInfo>;
export type SetAnnotations = {
  value?: VirtScriptObject;
} & BaseAction<ActionKind.SetAnnotations>;
export type RemoveAttribute = {
  name: string;
} & BaseAction<ActionKind.RemoveAttribute>;
export type SetText = {
  value: string;
} & BaseAction<ActionKind.SetText>;

export type Action =
  | ReplaceNode
  | InsertChild
  | DeleteChild
  | SetElementSourceInfo
  | SetAttribute
  | SetAnnotations
  | SetText
  | RemoveAttribute;

export type Mutation = {
  nodePath: number[];
  action: Action;
};


*/

// use super::virt::Rule;
// use crate::base::ast::ExprTextSource;
// use serde::Serialize;

// #[derive(Debug, PartialEq, Serialize, Clone)]
// pub struct SetSelectorText {
//   pub selector_text: String,
// }

// #[derive(Debug, PartialEq, Serialize, Clone)]
// pub struct InsertRule {
//   pub index: usize,
//   pub rule: Rule,
// }

// #[derive(Debug, PartialEq, Serialize, Clone)]
// pub struct ReplaceRule {
//   pub index: usize,
//   pub rule: Rule,
// }

// #[derive(Debug, PartialEq, Serialize, Clone)]
// pub struct DeleteRule {
//   pub index: usize,
// }

// #[derive(Debug, PartialEq, Serialize, Clone)]
// pub struct SetDeclaration {
//   pub name: String,
//   pub value: String,
// }

// #[derive(Debug, PartialEq, Serialize, Clone)]
// #[serde(tag = "kind")]
// pub enum Action {
//   InsertRule(InsertRule),
//   DeleteRule(DeleteRule),
//   ReplaceRule(ReplaceRule),
//   SetDeclaration(SetDeclaration),
//   SetSelectorText(SetSelectorText),
// }

// #[derive(Debug, PartialEq, Serialize, Clone)]
// pub struct Mutation {
//   pub path: Vec<usize>,
//   pub action: Action,
// }

export enum CSSMutationActionKind {
  InsertRule = "InsertRule",
  DeleteRule = "DeleteRule",
  ReplaceRule = "ReplaceRule",
  SetDeclaration = "SetDeclaration",
  SetSelectorText = "SetSelectorText"
}

export type BaseCSSAction<TKind extends CSSMutationActionKind> = {
  kind: TKind;
};

export type InsertRule = {
  index: number;
  rule: VirtRule;
};

export type DeleteRule = {
  index: number;
};

export type ReplaceRule = {
  index: number;
  rule: VirtRule;
};

export type SetDeclaration = {
  name: string;
  value: string;
};

export type SetSelectorText = {
  selectorText: string;
};

export type CSSAction =
  | InsertRule
  | DeleteRule
  | ReplaceRule
  | SetDeclaration
  | SetSelectorText;

export type CSSMutation = {
  path: number[];
  action: CSSAction;
};
