import { Sheet } from "../css/ast";
import { Node } from "../html/ast";

export enum ModuleKind {
  CSS = "CSS",
  PC = "PC"
}

type BaseModuleKind<TKind extends ModuleKind> = {
  moduleKind: TKind;
};

export type PCModule = Node & BaseModuleKind<ModuleKind.PC>;
export type CSSModule = Sheet & BaseModuleKind<ModuleKind.CSS>;

export type Module = PCModule | CSSModule;
