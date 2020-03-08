import { DOMFactory } from "../renderer";

export const mockDOMFactory: DOMFactory = {
  createElement: (tagName) => new MockElement(tagName) as any as HTMLElement,
  createDocumentFragment: () => new MockFragment() as Object as DocumentFragment,
  createTextNode: (nodeValue) => new MockTextNode(nodeValue)  as Object as Text,
}

abstract class BaseNode {
  $$parent: ParentNode;
  remove() {
    this.$$parent.removeChild(this);
  }
  get parentNode() {
    return this.$$parent;
  }
  get innerHTML() {
    return this.getInnerHTML();
  }
  abstract getInnerHTML();
  abstract toString();
}

abstract class ParentNode extends BaseNode {
  childNodes: BaseNode[] = [];
  appendChild(child: BaseNode) {
    child.$$parent = this;
    if (child instanceof MockFragment) {
      child.childNodes.forEach(child => {
        child.$$parent = this;
      })
      this.childNodes.push(...child.childNodes);
    } else {
      this.childNodes.push(child);
    }
  }
  removeChild(child: BaseNode) {
    child.$$parent = null;
    this.childNodes.splice(this.childNodes.indexOf(child), 1);
  }
  insertBefore(child: BaseNode, ref: BaseNode) {
    const index = this.childNodes.indexOf(ref);
    if (index === -1) {
      throw new Error(`ref not found`);
    }
    const children = child instanceof MockFragment ? child.childNodes : [child];
    for (const child of children) {
      child.$$parent = this;
    }
    this.childNodes.splice(index, 0, ...children);
  }
  getInnerHTML() {
    let buffer = "";

    for (const child of this.childNodes) {
      buffer += child.toString();
    }
    return buffer;
  }
}

class MockElement extends ParentNode {
  attributes = {};
  style = {};
  constructor(readonly tagName: string) {
    super();
  }
  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }
  addEventListener() {
  }
  removeAttribute(name: string) {
    delete this.attributes[name];
  }
  toString() {
    let buffer = `<${this.tagName}`;
    for (const name in this.attributes) {
      if (!this.attributes[name]) {
        continue;
      }
      buffer += ` ${name}=${JSON.stringify(this.attributes[name])}`;
    }
    buffer += `>`;
    buffer += this.getInnerHTML();
    buffer += `</${this.tagName}>`;
    return buffer;
  }
}

class MockFragment extends ParentNode {
  toString() {
    return "";
  }
}

class MockTextNode extends BaseNode {
  constructor(public nodeValue: string) {
    super();
  }
  getInnerHTML() {
    return this.toString();
  }
  toString() {
    return this.nodeValue;
  }
}