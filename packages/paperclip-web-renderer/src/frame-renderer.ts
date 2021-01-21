import {
  createNativeNode,
  createNativeStyleFromSheet,
  getNativeNodePath
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
  VirtualFragment,
  memoize,
  computeVirtJSObject,
  NodeAnnotations,
  VirtualFrame,
  getVirtTarget
} from "paperclip-utils";
import { EventEmitter } from "events";
import { arraySplice, traverseNativeNode } from "./utils";
import { patchNativeNode, Patchable } from "./dom-patcher";
import { DOMFactory } from "./base";

type Box = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export type Frame = {
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
  private _importedNativeStyles: HTMLStyleElement[];
  private _importedStyles: SheetInfo[];
  readonly namespaceURI = null;

  constructor(
    private _preview: VirtualNode,
    private _domFactory: DOMFactory = document,
    private _protocol: string = null
  ) {
    this._frames = [];
    this._childNodes = [];
    this._importedStyles = [];
    this._importedNativeStyles = [];
  }
  setPreview(preview: VirtualNode) {
    this._preview = preview;
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
        this._importedNativeStyles.splice(i, 1);
      }
    }

    // finally append
    this._importedStyles.push(...newStyles);

    for (const { sheet, uri } of newStyles) {
      const nativeSheet = createNativeStyleFromSheet(
        sheet,
        this._domFactory,
        this._protocol
      );
      this._importedNativeStyles.push(nativeSheet);
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
    const frame = this._frames[index];
    this._childNodes.splice(index, 1);
    this._frames = arraySplice(this._frames, index, 1);
  }
  insert(child: Node, index: number) {
    const _importedStylesContainer = this._domFactory.createElement("div");

    for (const style of this._importedNativeStyles) {
      _importedStylesContainer.appendChild(style.cloneNode(true));
    }
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
      sourceUri: null
    });
  }
}

/**
 * splits a file out into frames that can be
 */

export class FramesRenderer {
  private _dependencies: string[] = [];
  private _framesProxy: FramesProxy;
  private _preview: VirtualNode;

  constructor(
    private _targetUri: string,
    readonly protocol: string,
    private _domFactory: DOMFactory = document
  ) {
    this._framesProxy = new FramesProxy(
      this._preview,
      _domFactory,
      this.protocol
    );
  }

  setPreview(preview: VirtualNode) {
    this._preview = preview;
    this._framesProxy.setPreview(preview);
  }

  getPreview() {
    return this._preview;
  }

  get targetUri(): string {
    return this._targetUri;
  }

  get immutableFrames(): Frame[] {
    return this._framesProxy.immutableFrames;
  }

  public initialize({ sheet, importedSheets, preview }: LoadedData) {
    const children =
      preview.kind === VirtualNodeKind.Fragment ? preview.children : [preview];
    this._preview = preview;

    this._framesProxy = new FramesProxy(
      this._preview,
      this._domFactory,
      this.protocol
    );
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
            [{ uri: event.uri, sheet: event.data.sheet }],
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
        } else if (event.data.sheet) {
          this._framesProxy.updateImportedStyles(
            [{ uri: event.uri, sheet: event.data.sheet }],
            [event.uri]
          );
        }
        break;
      }
    }
  };

  public getRects(): Record<string, Box> {
    const rects: Record<string, Box> = {};
    for (let i = 0, { length } = this.immutableFrames; i < length; i++) {
      const frame = this.immutableFrames[i];
      const frameNode = getFrameVirtualNode(
        frame,
        this._framesProxy.immutableFrames,
        this._preview
      );
      if (!frameNode) {
        continue;
      }
      const annotations: NodeAnnotations =
        (frameNode.annotations && computeVirtJSObject(frameNode.annotations)) ||
        {};
      if (annotations.frame?.visible === false) {
        continue;
      }
      const bounds = getFrameBounds(frameNode);

      // mount child node _is_ the frame -- can only ever be one child
      traverseNativeNode(frame._mount.childNodes[0], (node, path) => {
        if (node.nodeType === 1) {
          const pathStr = i + "." + path.join(".");
          if (pathStr) {
            const clientRect = (node as Element).getBoundingClientRect();

            rects[pathStr] = {
              width: clientRect.width,
              height: clientRect.height,
              x: clientRect.left + bounds.x,
              y: clientRect.top + bounds.y
            };
          }
        }
      });

      // include frame sizes too
      rects[i] = bounds;
    }
    return rects;
  }
}

export const getFrameVirtualNode = (
  frame: Frame,
  frames: Frame[],
  preview: VirtualNode
): VirtualFrame => {
  if (!preview) {
    return null;
  }
  const children =
    preview.kind === VirtualNodeKind.Fragment ? preview.children : [preview];

  return children[frames.indexOf(frame)] as any;
};

export const getFrameBounds = memoize((node: VirtualElement | VirtualText) => {
  const annotations: NodeAnnotations =
    (node.annotations && computeVirtJSObject(node.annotations)) || {};
  return {
    width: 1024,
    height: 768,
    x: 0,
    y: 0,
    ...(annotations.frame || {})
  };
});

const removeAllChildren = (node: HTMLElement) => {
  while (node.childNodes.length) {
    node.removeChild(node.childNodes[0]);
  }
};
