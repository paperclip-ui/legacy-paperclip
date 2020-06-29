import { VirtualFragment, stringifyVirtualNode } from "paperclip";

export class PCDocument {
  styleSheets = [];
  documentElement;
  constructor(readonly root: VirtualFragment) {
    this.documentElement = this;
  }
  get outerHTML() {
    return `<html><head></head><body>${stringifyVirtualNode(
      this.root
    )}</body></html>`;
  }
  querySelectorAll() {
    return [];
  }
  cloneNode() {
    return this;
  }
}
