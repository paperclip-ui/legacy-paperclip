export type DOMFactory = {
  createElement(tagName: string): HTMLElement;
  createElementNS(namespace: string, tagName: string): HTMLElement;
  createDocumentFragment(): DocumentFragment;
  createTextNode(value: string): Text;
};
