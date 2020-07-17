import { DOMFactory, Renderer } from "../renderer";
import { Engine } from "paperclip";
import * as path from "path";

export const mockDOMFactory: DOMFactory = {
  createElement: tagName => (new MockElement(tagName) as any) as HTMLElement,
  createElementNS: tagName => (new MockElement(tagName) as any) as HTMLElement,
  createDocumentFragment: () => (new MockFragment() as any) as DocumentFragment,
  createTextNode: nodeValue => (new MockTextNode(nodeValue) as any) as Text
};

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
      });
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
  textContent = "";
  constructor(readonly tagName: string) {
    super();
  }
  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  // eslint-disable-next-line
  addEventListener() {}
  removeAttribute(name: string) {
    delete this.attributes[name];
  }
  toString() {
    let buffer = `<${this.tagName}`;
    const sortedAttributes = Object.keys(this.attributes)
      .sort()
      .map(name => ({ name, value: this.attributes[name] }));
    for (const { name, value } of sortedAttributes) {
      if (!value) {
        continue;
      }
      buffer += ` ${name}=${JSON.stringify(value)}`;
    }
    buffer += `>`;
    buffer +=
      this.getInnerHTML() || this.textContent.replace(/[\s\r\n\t]+/g, " ");
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

export type Graph = {
  [identifier: string]: string;
};

export const createMockEngine = (graph: Graph) =>
  new Engine({
    io: {
      readFile: uri => graph[uri.replace("file://", "")] || graph[uri],
      fileExists: uri =>
        Boolean(graph[uri.replace("file://", "")] || graph[uri]),
      resolveFile: (from, to) => {
        const prefix = from.indexOf("file:") === 0 ? "file://" : "";
        return (
          prefix + path.join(path.dirname(from.replace("file://", "")), to)
        );
      }
    }
  });

export const createMockRenderer = (uri: string, protocol = "") =>
  new Renderer(protocol, uri, mockDOMFactory);
