import { Node } from "../html/ast";
import { Sheet } from "../css/ast";

export enum DependencyContentKind {
  Node = "Node",
  Stylsheet = "Stylesheet"
}

export type BaeDependencyContent<TKind> = {
  contentKind: TKind;
};

export type DependencyNodeContent = BaeDependencyContent<
  DependencyContentKind.Node
> &
  Node;
export type DependencyStyleSheetContent = BaeDependencyContent<
  DependencyContentKind.Stylsheet
> &
  Sheet;
export type DependencyContent =
  | DependencyNodeContent
  | DependencyStyleSheetContent;

export type Dependency = {
  uri: string;
  dependencies: Record<string, string>;
  dependencyUriMaps: Record<string, string>;
  content: DependencyContent;
};

export type DependencyGraph = Record<string, Dependency>;
