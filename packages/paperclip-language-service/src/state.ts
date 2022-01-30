export enum AvailableNodeKind {
  Text = "Text",
  Element = "Element",
  Instance = "Instance",
}

export type AvailableBaseNode<TKind extends AvailableNodeKind> = {
  kind: TKind;
  displayName: string;
  name: string;
  description: string;
};

export type AvailableText = AvailableBaseNode<AvailableNodeKind.Text>;
export type AvailableElement = AvailableBaseNode<AvailableNodeKind.Element>;
export type AvailableInstance = {
  // where does the component live??
  sourceUri: string;

  // when active document is included and import already exists
  namespace?: string;
} & AvailableBaseNode<AvailableNodeKind.Instance>;

export type AvailableNode =
  | AvailableText
  | AvailableElement
  | AvailableInstance;
