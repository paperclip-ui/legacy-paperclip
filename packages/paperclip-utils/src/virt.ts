export enum VirtualNodeKind {
  Element = "Element",
  Text = "Text",
  Fragment = "Fragment",
  StyleElement = "StyleElement"
}

type VirtualBaseNode<KKind extends VirtualNodeKind> = {
  kind: KKind;
};

export type VirtualStyleElement = {
  sheet: any;
} & VirtualBaseNode<VirtualNodeKind.StyleElement>;

export type VirtualElement = {
  tagName: string,
  attributes: {
    [identifier: string]: string | null
  }
  children: VirtualNode[];
} & VirtualBaseNode<VirtualNodeKind.Element>;

export type VirtualText = {
  value: string;
} & VirtualBaseNode<VirtualNodeKind.Text>;

export type VirtualFragment = {
  children: VirtualNode
} & VirtualBaseNode<VirtualNodeKind.Fragment>;

export type VirtualNode = VirtualElement | VirtualText | VirtualFragment | VirtualStyleElement;
