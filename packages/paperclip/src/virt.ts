export enum VirtualNodeKind {
  Element = "Element",
  Text = "Text",
  Fragment = "Fragment"
}

type VirtualBaseNode<KKind extends VirtualNodeKind> = {
  kind: KKind;
};

export type VirtualAttribute = {
  name: string;
  value: string;
};
export type VirtualElement = {
  attributes: VirtualAttribute[];
  children: VirtualNode;
} & VirtualBaseNode<VirtualNodeKind.Element>;

export type VirtualText = {
  value: string;
} & VirtualBaseNode<VirtualNodeKind.Element>;

export type VirtualNode = VirtualElement | VirtualText;
