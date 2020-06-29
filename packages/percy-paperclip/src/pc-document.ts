import { VirtualFragment, stringifyVirtualNode } from "paperclip";

export class PCDocument {
  styleSheets = [];
  documentElement;
  constructor(readonly URL: string, readonly root: VirtualFragment) {
    this.documentElement = this;
  }
  get outerHTML() {
    return `<html><head></head><body><style>body { margin: 0px; padding: 0px }</style>${stringifyVirtualNode(
      this.root
    )}</body></html>`.replace(/className/g, "class");
  }
  querySelectorAll() {
    return [];
  }
  cloneNode() {
    return this;
  }
}
