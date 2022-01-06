import { EngineMode, createEngineDelegate } from "@paperclipui/core";
import * as path from "path";

export const mockDOMFactory: any = {
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
  abstract cloneNode();
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

  cloneNode() {
    const el = new MockElement(this.tagName);
    for (const key in this.attributes) {
      el.setAttribute(key, el.attributes[key]);
    }
    el.textContent = this.textContent;
    for (const child of this.childNodes) {
      el.appendChild(child.cloneNode());
    }
    return el;
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
  cloneNode() {
    const clone = new MockFragment();
    for (const child of this.childNodes) {
      clone.appendChild(child.cloneNode());
    }
    return clone;
  }
  toString() {
    return "";
  }
}

class MockTextNode extends BaseNode {
  constructor(public nodeValue: string) {
    super();
  }
  cloneNode() {
    return new MockTextNode(this.nodeValue);
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
  createEngineDelegate({
    io: {
      readFile: uri =>
        graph[uri.replace("file://", "")] || graph[uri.replace(/\\+/g, "/")],
      fileExists: uri =>
        Boolean(
          graph[uri.replace("file://", "")] || graph[uri.replace(/\\+/g, "/")]
        ),
      resolveFile: (from, to) => {
        const prefix = from.indexOf("file:") === 0 ? "file://" : "";

        return (
          prefix +
          path
            .join(path.dirname(from.replace("file://", "")), to)
            .replace(/\\+/g, "/")
        );
      }
    }
  });

export const createMockEngineDelegate = (
  graph: Graph,
  mode: EngineMode = EngineMode.SingleFrame
) =>
  createEngineDelegate({
    io: {
      readFile: uri =>
        graph[uri.replace("file://", "")] || graph[uri.replace(/\\+/g, "/")],
      fileExists: uri =>
        Boolean(
          graph[uri.replace("file://", "")] || graph[uri.replace(/\\+/g, "/")]
        ),
      resolveFile: (from, to) => {
        const prefix = from.indexOf("file:") === 0 ? "file://" : "";

        return (
          prefix +
          path
            .join(path.dirname(from.replace("file://", "")), to)
            .replace(/\\+/g, "/")
        );
      }
    },
    mode
  });

export const trimWS = (str: string) => str.replace(/[\s\r\n\t]+/g, " ");
