import {
  createNativeNode,
  createNativeStyleFromSheet
} from "./native-renderer";
import {
  EngineDelegateEvent,
  EngineDelegateEventKind,
  patchVirtNode,
  SheetInfo,
  LoadedData,
  VirtualNodeKind
} from "paperclip-utils";
import { EventEmitter } from "events";
import { traverseNativeNode } from "./utils";
import { patchNativeNode, Patchable } from "./dom-patcher";

export type DOMFactory = {
  createElement(tagName: string): HTMLElement;
  createElementNS(namespace: string, tagName: string): HTMLElement;
  createDocumentFragment(): DocumentFragment;
  createTextNode(value: string): Text;
};

export type Frame = {
  bounds: {
    width: number;
    height: number;
    left: number;
    top: number;
  };

  // URI of the PC file associated with this frame
  sourceUri: string;

  _importedStylesContainer: HTMLElement;
  _mainStylesContainer: HTMLElement;
  _mount: HTMLElement;

  stage: HTMLElement;
};

// TODO - need to considr fragments

class FramesProxy implements Patchable {
  private _frames: Frame[];
  private _childNodes: ChildNode[];
  private _mainStyle: HTMLStyleElement;
  readonly namespaceURI = null;

  constructor(private _domFactory: DOMFactory = document) {
    this._frames = [];
    this._childNodes = [];
  }
  get frames() {
    return this._frames;
  }
  get childNodes() {
    return this._childNodes;
  }
  setImportedSheets;
  setMainStyle(style: HTMLStyleElement) {
    this._mainStyle = style;
    for (const frame of this._frames) {
      removeAllChildren(frame._mainStylesContainer);
      frame._mainStylesContainer.appendChild(style.cloneNode(true));
    }
  }
  appendChild(child: Node) {
    this.insert(child, this._frames.length);
  }
  insertBefore(child: Node, existing: HTMLElement) {
    this.insert(
      child,
      this._childNodes.findIndex(_child => _child === existing)
    );
  }
  removeChild(child: Node) {
    const index = this._childNodes.findIndex(_child => _child === child);
    this._childNodes.splice(index, 1);
    this._frames.splice(index, 1);
  }
  insert(child: Node, index: number) {
    const _importedStylesContainer = this._domFactory.createElement("div");
    const _mainStylesContainer = this._domFactory.createElement("div");
    if (this._mainStyle) {
      _mainStylesContainer.appendChild(this._mainStyle.cloneNode(true));
    }
    const _mount = this._domFactory.createElement("div");
    const stage = this._domFactory.createElement("div");
    stage.appendChild(_importedStylesContainer);
    stage.appendChild(_mainStylesContainer);
    stage.appendChild(_mount);

    _mount.appendChild(child);
    this._childNodes.splice(index, 0, child as ChildNode);

    this._frames.splice(index, 0, {
      stage,
      _importedStylesContainer,
      _mainStylesContainer,
      _mount,
      sourceUri: null,
      bounds: null
    });
  }
}

/**
 * DEPRECATED. Use frame-renderer + DIV frame creator
 */

export class FramesRenderer {
  private _em: EventEmitter;
  private _hoverOverlay: HTMLElement;
  private _dependencies: string[] = [];
  private _importedStyles: Record<string, HTMLElement>;
  private _framesProxy: FramesProxy;

  constructor(
    readonly protocol: string,
    private _targetUri: string,
    private _domFactory: DOMFactory = document
  ) {
    this._importedStyles = {};
    this._framesProxy = new FramesProxy(_domFactory);
    this._em = new EventEmitter();
  }

  get targetUri(): string {
    return this._targetUri;
  }

  get frames(): Frame[] {
    return this._framesProxy.frames;
  }

  private _addSheets(importedSheets: SheetInfo[]) {
    for (const { uri, sheet } of importedSheets) {
      const nativeSheet = createNativeStyleFromSheet(
        sheet,
        this._domFactory,
        this.protocol
      );
      this._importedStyles[uri] = nativeSheet;
      for (const frame of this.frames) {
        frame._importedStylesContainer.appendChild(nativeSheet.cloneNode(true));
      }
    }
  }

  private _removeSheets(uris: string[]) {
    for (const uri of uris) {
      // Note that this should always exist. If null, then we want an error to be thrown.
      this._importedStyles[uri].remove();
      delete this._importedStyles[uri];
    }
  }

  private _initialize({ sheet, importedSheets, preview }: LoadedData) {
    const children =
      preview.kind === VirtualNodeKind.Fragment ? preview.children : [preview];

    this._framesProxy = new FramesProxy(this._domFactory);
    this._dependencies = importedSheets.map(info => info.uri);

    const mainStyle = createNativeStyleFromSheet(
      sheet,
      this._domFactory,
      this.protocol
    );

    this._framesProxy.setMainStyle(mainStyle);

    for (const child of children) {
      const childNode = createNativeNode(
        child,
        this._domFactory,
        this.protocol,
        null
      );
      this._framesProxy.appendChild(childNode);
    }

    this._addSheets(importedSheets);
  }

  /**
   * delegate.onEvent(renderer.handleEngineDelegateEvent);
   */

  public handleEngineDelegateEvent = (event: EngineDelegateEvent): void => {
    switch (event.kind) {
      case EngineDelegateEventKind.ChangedSheets: {
        if (event.uri === this.targetUri) {
          this._dependencies = event.data.allDependencies;
          this._addSheets(event.data.newSheets);
          this._removeSheets(event.data.removedSheetUris);
        }
        break;
      }
      case EngineDelegateEventKind.Loaded: {
        if (event.uri === this.targetUri) {
          this._dependencies = event.data.allDependencies;
          this._initialize(event.data);
        }
        break;
      }
      case EngineDelegateEventKind.Evaluated: {
        if (event.uri === this.targetUri) {
          this._dependencies = event.data.allDependencies;
        } else if (this._dependencies.includes(event.uri)) {
          const impStyle = this._importedStyles[event.uri];
          if (impStyle) {
            impStyle.remove();
          }
          const style = (this._importedStyles[
            event.uri
          ] = createNativeStyleFromSheet(
            event.data.sheet,
            this._domFactory,
            this.protocol
          ));

          for (const frame of this.frames) {
            frame._importedStylesContainer.appendChild(style.cloneNode(true));
          }
        }
        break;
      }
      case EngineDelegateEventKind.Diffed: {
        if (event.uri === this.targetUri) {
          patchNativeNode(
            this._framesProxy,
            event.data.mutations,
            this._domFactory,
            this.protocol
          );

          if (event.data.sheet) {
            const sheet = createNativeStyleFromSheet(
              event.data.sheet,
              this._domFactory,
              this.protocol
            );
            for (const frame of this._framesProxy.frames) {
              removeAllChildren(frame._mainStylesContainer);
              frame._mainStylesContainer.appendChild(sheet.cloneNode(true));
            }
          }

          for (const importedSheetUri in this._importedStyles) {
            if (!event.data.allDependencies.includes(importedSheetUri)) {
              const sheet = this._importedStyles[importedSheetUri];
              sheet.remove();
              delete this._importedStyles[importedSheetUri];
            }
          }
        } else if (event.data.sheet) {
          // this._importedStylesContainer.appendChild(createNativeStyleFromSheet(event.sheet, this._domFactory, this.protocol));
          const impStyle = this._importedStyles[event.uri];
          if (impStyle) {
            impStyle.remove();
          }

          const element = (this._importedStyles[
            event.uri
          ] = createNativeStyleFromSheet(
            event.data.sheet,
            this._domFactory,
            this.protocol
          ));

          for (const frame of this._framesProxy.frames) {
            frame._importedStylesContainer.appendChild(element.cloneNode(true));
          }
        }

        break;
      }
    }
  };

  public getRects() {
    const rects: Record<string, ClientRect> = {};
    for (const frame of this.frames) {
      traverseNativeNode(frame.stage, (node, path) => {
        if (node.nodeType === 1) {
          const pathStr = path.join(".");
          if (pathStr) {
            rects[pathStr] = (node as Element).getBoundingClientRect();
          }
        }
      });
    }
    return rects;
  }
}

const removeAllChildren = (node: HTMLElement) => {
  while (node.childNodes.length) {
    node.removeChild(node.childNodes[0]);
  }
};
