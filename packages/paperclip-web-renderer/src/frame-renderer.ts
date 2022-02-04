import {
  createNativeNode,
  createNativeStyleFromSheet,
  UrlResolver,
} from "./native-renderer";
import {
  EngineDelegateEvent,
  EngineDelegateEventKind,
  SheetInfo,
  VirtualNodeKind,
  VirtualNode,
  VirtualText,
  VirtualElement,
  patchVirtNode,
  memoize,
  computeVirtScriptObject,
  NodeAnnotations,
  VirtualFrame,
  DiffedDataKind,
  EvaluatedDataKind,
  LoadedPCData,
  patchCSSSheet,
} from "@paperclip-ui/utils";
import { arraySplice, getFrameBounds, traverseNativeNode } from "./utils";
import { patchNativeNode, Patchable } from "./dom-patcher";
import { DOMFactory } from "./base";
import { patchCSSOM } from "./cssom-patcher";
import { ImmutableStore } from "@paperclip-ui/common";

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

type FramesProxyState = {
  frames: Frame[];
};

class FramesProxy implements Patchable {
  private _store: ImmutableStore<FramesProxyState>;
  private _childNodes: ChildNode[];
  private _mainStyle: any;
  private _importedNativeStyles: HTMLStyleElement[];
  private _importedStyles: SheetInfo[];
  readonly namespaceURI = null;

  constructor(
    private _renderer: FramesRenderer,
    bindState: (state: FramesProxyState) => void
  ) {
    this._childNodes = [];
    this._importedStyles = [];
    this._importedNativeStyles = [];
    this._store = new ImmutableStore({ frames: [] }, bindState);
  }
  getState(): FramesProxyState {
    return this._store.getState();
  }
  get childNodes() {
    return this._childNodes;
  }
  get importedStyles() {
    return this._importedStyles;
  }
  setMainStyle(style: any) {
    this._mainStyle = style;
    const nativeStyle = createNativeStyleFromSheet(
      style,
      this._renderer.getDOMFactory(),
      this._renderer.getUrlResolver()
    );
    for (const frame of this.getState().frames) {
      removeAllChildren(frame._mainStylesContainer);
      frame._mainStylesContainer.appendChild(nativeStyle.cloneNode(true));
    }
  }
  applyStylePatches(mutations: any[], uri?: string) {
    const styleIndex = this._importedStyles.findIndex((style) => {
      return style.uri === uri;
    });

    // first do the frames
    for (const frame of this.getState().frames) {
      const styleElement = (styleIndex !== -1
        ? frame._importedStylesContainer.childNodes[styleIndex]
        : frame._mainStylesContainer.childNodes[0]) as any as HTMLStyleElement;

      patchCSSOM(
        styleElement.sheet as any,
        mutations,
        this._renderer.getUrlResolver()
      );
    }

    // note we patch the virt objects here since native styles don't parse text unless
    // mounted so we don't have access to that
    if (styleIndex === -1) {
      this._mainStyle = patchCSSSheet(this._mainStyle, mutations);
    } else {
      this._importedStyles[styleIndex] = {
        ...this._importedStyles[styleIndex],
        sheet: patchCSSSheet(this._importedStyles[styleIndex].sheet, mutations),
      };
    }
  }

  updateImportedStyles(newStyles: SheetInfo[], removeStyleUris: string[] = []) {
    const rmIndices = [];

    // need to remove sheet in case we're looking to replace
    for (let i = this._importedStyles.length; i--; ) {
      const style = this._importedStyles[i];
      if (removeStyleUris.includes(style.uri)) {
        rmIndices.push(i);
        this._importedStyles.splice(i, 1);
        this._importedNativeStyles.splice(i, 1);
      }
    }
    for (const i of rmIndices) {
      for (const frame of this.getState().frames) {
        const nativeSheet = frame._importedStylesContainer.childNodes[i];
        nativeSheet.remove();
      }
    }

    // finally append

    for (const info of newStyles) {
      const { sheet, index } = info;
      this._importedStyles.splice(index, 0, info);
      const nativeSheet = createNativeStyleFromSheet(
        sheet,
        this._renderer.getDOMFactory(),
        this._renderer.getUrlResolver()
      );

      this._importedNativeStyles.splice(index, 0, nativeSheet);
      for (const frame of this.getState().frames) {
        const beforeChild = frame._importedStylesContainer.childNodes[index];
        const sheet = nativeSheet.cloneNode(true);
        if (beforeChild) {
          frame._importedStylesContainer.insertBefore(sheet, beforeChild);
        } else {
          frame._importedStylesContainer.appendChild(sheet);
        }
      }
    }
  }
  appendChild(child: Node) {
    this.insert(child, this.getState().frames.length);
  }
  insertBefore(child: Node, existing: HTMLElement) {
    this.insert(
      child,
      this._childNodes.findIndex((_child) => _child === existing)
    );
  }
  removeChild(child: Node) {
    const index = this._childNodes.findIndex((_child) => _child === child);
    this._childNodes.splice(index, 1);
    this._store.update((state) => {
      state.frames = arraySplice(state.frames, index, 1);
    });
  }
  insert(child: Node, index: number) {
    const _importedStylesContainer = this._renderer
      .getDOMFactory()
      .createElement("div");

    for (const style of this._importedNativeStyles) {
      _importedStylesContainer.appendChild(style.cloneNode(true));
    }
    const _mainStylesContainer = this._renderer
      .getDOMFactory()
      .createElement("div");
    if (this._mainStyle) {
      _mainStylesContainer.appendChild(
        createNativeStyleFromSheet(
          this._mainStyle,
          this._renderer.getDOMFactory(),
          this._renderer.getUrlResolver()
        )
      );
    }
    const _mount = this._renderer.getDOMFactory().createElement("div");
    const stage = this._renderer.getDOMFactory().createElement("div");
    stage.appendChild(_importedStylesContainer);
    stage.appendChild(_mainStylesContainer);
    stage.appendChild(_mount);

    _mount.appendChild(child);

    this._childNodes.splice(index, 0, child as ChildNode);

    this._store.update((state) => {
      state.frames = arraySplice(state.frames, index, 0, {
        stage,
        _importedStylesContainer,
        _mainStylesContainer,
        _mount,
        sourceUri: null,
      });
    });
  }
}

export type FramesRendererState = {
  uri: string;
  frames: Frame[];
  preview?: VirtualNode;
};

/**
 * splits a file out into frames that can be
 */

export class FramesRenderer {
  private _dependencies: string[] = [];
  private _framesProxy: FramesProxy;
  private _domFactory: DOMFactory;
  private _store: ImmutableStore<FramesRendererState>;
  private _imp: any;
  public onChange: (state: FramesRendererState) => void;

  constructor(
    targetUri: string,
    private _resolveUrl: (url: string) => string,
    domFactory: DOMFactory,
    connectState: (state: FramesRendererState) => void
  ) {
    this._domFactory = domFactory || document;
    this._store = new ImmutableStore(
      {
        uri: targetUri,
        frames: [],
      },
      connectState
    );

    this._framesProxy = new FramesProxy(this, this._onFramesProxyChange);
  }

  getUrlResolver() {
    return this._resolveUrl;
  }

  getDOMFactory() {
    return this._domFactory;
  }

  setUrlResolver(value: UrlResolver) {
    this._resolveUrl = value;
  }

  setPreview(preview: VirtualNode) {
    this._store.update((newState) => {
      newState.preview = preview;
    });
  }

  get targetUri(): string {
    return this._store.getState().uri;
  }

  getState() {
    return this._store.getState();
  }

  private _onFramesProxyChange = (frameState: FramesProxyState) => {
    this._store.update((newState) => {
      newState.frames = frameState.frames;
    });
  };

  public initialize({
    sheet,
    importedSheets,
    preview,
    allImportedSheetUris,
  }: LoadedPCData) {
    const children =
      preview.kind === VirtualNodeKind.Fragment ? preview.children : [preview];
    this.setPreview(preview);

    this._imp = importedSheets;

    this._framesProxy = new FramesProxy(this, this._onFramesProxyChange);

    this._dependencies = allImportedSheetUris;
    this._framesProxy.setMainStyle(sheet);

    for (const child of children) {
      const childNode = createNativeNode(
        child,
        this._domFactory,
        this._resolveUrl,
        null,
        false
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
          this._dependencies = event.data.allImportedSheetUris;
          this._framesProxy.updateImportedStyles(
            event.data.newSheets,
            event.data.removedSheetUris
          );
        }
        break;
      }
      case EngineDelegateEventKind.Loaded: {
        if (event.data.kind === EvaluatedDataKind.PC) {
          if (event.uri === this.targetUri) {
            this._dependencies = event.data.allImportedSheetUris;
            this.initialize(event.data);
          }
        }
        break;
      }
      case EngineDelegateEventKind.Evaluated: {
        if (event.data.kind === EvaluatedDataKind.PC) {
          if (event.uri === this.targetUri) {
            this._dependencies = event.data.allImportedSheetUris;
          } else if (this._dependencies.includes(event.uri)) {
            this._framesProxy.updateImportedStyles(
              [
                {
                  uri: event.uri,
                  sheet: event.data.sheet,
                  index: this._dependencies.indexOf(event.uri),
                },
              ],
              [event.uri]
            );
          }
        }
        break;
      }
      case EngineDelegateEventKind.Diffed: {
        if (event.data.kind === DiffedDataKind.PC) {
          if (
            this.targetUri !== event.uri &&
            !this._dependencies.includes(event.uri)
          ) {
            break;
          }

          // Style patches need to happen _before_ patching frames since style elements don't have
          // their sheets until their mounted
          this._framesProxy.applyStylePatches(
            event.data.sheetMutations,
            event.uri
          );

          if (event.uri === this.targetUri) {
            this._dependencies = event.data.allImportedSheetUris;

            patchNativeNode(
              this._framesProxy,
              event.data.mutations,
              this._domFactory,
              false,
              this._resolveUrl
            );

            this.setPreview(
              patchVirtNode(this.getState().preview, event.data.mutations)
            );
          }
        } else if (event.data.kind === DiffedDataKind.CSS) {
          if (!this._dependencies.includes(event.uri)) {
            break;
          }

          this._framesProxy.applyStylePatches(event.data.mutations, event.uri);
        }
        break;
      }
    }
  };

  public getRects(): Record<string, Box> {
    const rects: Record<string, Box> = {};
    for (let i = 0, { length } = this.getState().frames; i < length; i++) {
      const frame = this.getState().frames[i];
      const frameNode = getFrameVirtualNode(
        frame,
        this.getState().frames,
        this.getState().preview
      );
      if (!frameNode) {
        continue;
      }

      const bounds = getFrameBounds(frameNode);

      // mount child node _is_ the frame -- can only ever be one child
      traverseNativeNode(frame._mount.childNodes[0], (node, path) => {
        if (node.nodeType === 1) {
          const pathStr = path.length ? i + "." + path.join(".") : i;
          if (pathStr) {
            const clientRect = (node as Element).getBoundingClientRect();

            rects[pathStr] = {
              width: clientRect.width,
              height: clientRect.height,
              x: clientRect.left + bounds.x,
              y: clientRect.top + bounds.y,
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

const removeAllChildren = (node: HTMLElement) => {
  while (node.childNodes.length) {
    node.removeChild(node.childNodes[0]);
  }
};
