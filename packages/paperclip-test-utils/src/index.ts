import * as path from "path";
import * as CSSOM from "cssom";
import * as url from "url";

export const mockDOMFactory = {
  createElement: (tagName) => {
    if (tagName === "style") {
      return new StyleElement() as any as HTMLElement;
    }

    return new MockElement(tagName) as any as HTMLElement;
  },
  createElementNS: (tagName) => new MockElement(tagName) as any as HTMLElement,
  createDocumentFragment: () => new MockFragment() as any as DocumentFragment,
  createTextNode: (nodeValue) => new MockTextNode(nodeValue) as any as Text,
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
      child.childNodes.forEach((child) => {
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

class StyleElement extends ParentNode {
  private _textContent: string;
  private _sheet: CSSOM.StyleSheet;

  get textContent() {
    return this._textContent;
  }
  set textContent(value: string) {
    this._textContent = value;
    this._sheet = CSSOM.parse(value);
  }
  get sheet() {
    return this._sheet;
  }
  cloneNode() {
    const el = new StyleElement();
    el.textContent = this.sheet.toString();
    return el;
  }
  toString() {
    return `<style>${this._sheet.toString().replace(/\n+/g, " ")}</style>`;
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
      .map((name) => ({ name, value: this.attributes[name] }));
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
const stripFileProtocol = (uri) => uri.replace("file://", "");

const mockReadFile = (graph: Graph) => (uri: string | URL) => {
  const path = uri instanceof URL ? uri.href : uri;
  return graph[path.replace("file://", "")] || graph[path.replace(/\\+/g, "/")];
};

const mockReadDir = (graph: Graph) => (uri: string | URL) => {
  const path = uri instanceof URL ? url.fileURLToPath(uri.href) : uri;
  return Object.keys(graph)
    .map(stripFileProtocol)
    .filter((fp) => fp.indexOf(path) === 0)
    .map((p) => p.split("/").pop());
};

const graphContains = (graph, path) =>
  Object.keys(graph).some((fp) => stripFileProtocol(fp).indexOf(path) === 0);

const mockLStatSync = (graph: Graph) => (uri: string | URL) => {
  const path = uri instanceof URL ? url.fileURLToPath(uri.href) : uri;

  // simulate lstat sync
  if (!graphContains(graph, path)) {
    throw new Error(`no such file or directory`);
  }

  return {
    isDirectory() {
      return (
        !graph[path] && !graph["file://" + path] && graphContains(graph, path)
      );
    },
    isSymbolicLink() {
      return false;
    },
  };
};

const mockExistsSync = (graph: Graph) => {
  return (uri) => {
    const path = uri instanceof URL ? url.fileURLToPath(uri.href) : uri;
    return graphContains(graph, path);
  };
};

export const mockFs = (graph: Graph) => ({
  realpathSync(uri: string | URL) {
    if (uri instanceof URL) {
      return url.fileURLToPath(uri.href);
    }
    return uri;
  },
  readFileSync: mockReadFile(graph),
  readdirSync: mockReadDir(graph),
  existsSync: mockExistsSync(graph),
  lstatSync: mockLStatSync(graph),
});

export const createMockEngineDelegate =
  (engineFactory) =>
  (graph: Graph, mode = "SingleFrame") =>
    engineFactory({
      io: {
        readFile: mockReadFile(graph),
        fileExists: (uri) =>
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
        },
      },
      mode,
    });

// eslint-disable-next-line
const noop = () => {};

export const trimWS = (str: string) => str.replace(/[\s\r\n\t]+/g, " ");
