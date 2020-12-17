import {
  createNativeNode,
  createNativeStyleFromSheet
} from "./native-renderer";
import {
  EngineDelegateEvent,
  EngineDelegateEventKind,
  SheetInfo,
  LoadedData,
  VirtualNodeKind,
  VirtualNode,
  VirtualText,
  VirtualElement,
  patchVirtNode,
  VirtualFragment
} from "paperclip-utils";
import { EventEmitter } from "events";
import { arraySplice, traverseNativeNode } from "./utils";
import { patchNativeNode, Patchable } from "./dom-patcher";
import { DOMFactory } from "./base";
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

class FramesProxy implements Patchable {
  private _frames: Frame[];
  private _childNodes: ChildNode[];
  private _mainStyle: any;
  private _mainNativeStyle: HTMLStyleElement;
  private _importedStyles: SheetInfo[];
  readonly namespaceURI = null;

  constructor(
    private _domFactory: DOMFactory = document,
    private _protocol: string = null
  ) {
    this._frames = [];
    this._childNodes = [];
    this._importedStyles = [];
  }
  get immutableFrames() {
    return this._frames;
  }
  get childNodes() {
    return this._childNodes;
  }
  get importedStyles() {
    return this._importedStyles;
  }
  setMainStyle(style: any) {
    this._mainStyle = style;
    const nativeStyle = (this._mainNativeStyle = createNativeStyleFromSheet(
      style,
      this._domFactory,
      this._protocol
    ));
    for (const frame of this._frames) {
      removeAllChildren(frame._mainStylesContainer);
      frame._mainStylesContainer.appendChild(nativeStyle.cloneNode(true));
    }
  }
  updateImportedStyles(newStyles: SheetInfo[], removeStyleUris: string[] = []) {
    const rmIndices = [];

    // need to remove sheet in case we're looking to replace
    for (let i = this._importedStyles.length; i--; ) {
      const style = this._importedStyles[i];
      if (removeStyleUris.includes(style.uri)) {
        rmIndices.unshift(i);
        this._importedStyles.splice(i, 1);
      }
    }

    // finally append
    this._importedStyles.push(...newStyles);

    for (const { sheet } of newStyles) {
      const nativeSheet = createNativeStyleFromSheet(
        sheet,
        this._domFactory,
        this._protocol
      );
      for (const frame of this._frames) {
        frame._importedStylesContainer.appendChild(nativeSheet.cloneNode(true));
      }
    }

    for (const i of rmIndices) {
      for (const frame of this._frames) {
        const nativeSheet = frame._importedStylesContainer.childNodes[i];
        nativeSheet.remove();
      }
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
    this._frames = arraySplice(this._frames, index, 1);
  }
  insert(child: Node, index: number) {
    const _importedStylesContainer = this._domFactory.createElement("div");
    const _mainStylesContainer = this._domFactory.createElement("div");
    if (this._mainNativeStyle) {
      _mainStylesContainer.appendChild(this._mainNativeStyle.cloneNode(true));
    }
    const _mount = this._domFactory.createElement("div");
    const stage = this._domFactory.createElement("div");
    stage.appendChild(_importedStylesContainer);
    stage.appendChild(_mainStylesContainer);
    stage.appendChild(_mount);

    _mount.appendChild(child);
    this._childNodes.splice(index, 0, child as ChildNode);

    this._frames = arraySplice(this._frames, index, 0, {
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
 * splits a file out into frames that can be
 */

export class FramesRenderer {
  private _em: EventEmitter;
  private _dependencies: string[] = [];
  private _framesProxy: FramesProxy;
  private _preview: VirtualNode;

  constructor(
    private _targetUri: string,
    readonly protocol: string,
    private _domFactory: DOMFactory = document
  ) {
    this._framesProxy = new FramesProxy(_domFactory);
    this._em = new EventEmitter();
  }

  get targetUri(): string {
    return this._targetUri;
  }

  getFrameVirtualNode(frame: Frame): VirtualElement | VirtualText {
    const children =
      this._preview.kind === VirtualNodeKind.Fragment
        ? this._preview.children
        : [this._preview];

    return children[this._framesProxy.immutableFrames.indexOf(frame)] as any;
  }

  get immutableFrames(): Frame[] {
    return this._framesProxy.immutableFrames;
  }

  public initialize({ sheet, importedSheets, preview }: LoadedData) {
    const children =
      preview.kind === VirtualNodeKind.Fragment ? preview.children : [preview];
    this._preview = preview;

    this._framesProxy = new FramesProxy(this._domFactory);
    this._dependencies = importedSheets.map(info => info.uri);
    this._framesProxy.setMainStyle(sheet);

    for (const child of children) {
      const childNode = createNativeNode(
        child,
        this._domFactory,
        this.protocol,
        null
      );
      this._framesProxy.appendChild(childNode);
    }

    this._framesProxy.updateImportedStyles(importedSheets);
  }

  /**
   * delegate.onEvent(renderer.handleEngineDelegateEvent);
   */

  public handleEngineDelegateEvent = (event: EngineDelegateEvent): void => {
    switch (event.kind) {
      case EngineDelegateEventKind.ChangedSheets: {
        if (event.uri === this.targetUri) {
          this._dependencies = event.data.allDependencies;
          this._framesProxy.updateImportedStyles(
            event.data.newSheets,
            event.data.removedSheetUris
          );
        }
        break;
      }
      case EngineDelegateEventKind.Loaded: {
        if (event.uri === this.targetUri) {
          this._dependencies = event.data.allDependencies;
          this.initialize(event.data);
        }
        break;
      }
      case EngineDelegateEventKind.Evaluated: {
        if (event.uri === this.targetUri) {
          this._dependencies = event.data.allDependencies;
        } else if (this._dependencies.includes(event.uri)) {
          // Replace
          this._framesProxy.updateImportedStyles(
            [event.data.sheet],
            [event.uri]
          );
        }
        break;
      }
      case EngineDelegateEventKind.Diffed: {
        if (event.uri === this.targetUri) {
          this._dependencies = event.data.allDependencies;

          patchNativeNode(
            this._framesProxy,
            event.data.mutations,
            this._domFactory,
            this.protocol
          );

          if (event.data.sheet) {
            this._framesProxy.setMainStyle(event.data.sheet);
          }

          this._preview = patchVirtNode(this._preview, event.data.mutations);
        }
        break;
      }
    }
  };

  public getRects(): Record<string, ClientRect> {
    const rects: Record<string, ClientRect> = {};
    for (const frame of this.immutableFrames) {
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
