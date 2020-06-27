import {
  createNativeNode,
  getNativeNodePath,
  createNativeStyleFromSheet
} from "./native-renderer";
import {
  EngineEvent,
  EngineEventKind,
  getVirtTarget,
  patchVirtNode
} from "paperclip-utils";
import { EventEmitter } from "events";
import { preventDefault } from "./utils";
import { patchNativeNode } from "./dom-patcher";

export type DOMFactory = {
  createElement(tagName: string): HTMLElement;
  createElementNS(namespace: string, tagName: string): HTMLElement;
  createDocumentFragment(): DocumentFragment;
  createTextNode(value: string): Text;
};

enum RenderEventTypes {
  META_CLICK = "META_CLICK"
}

export class Renderer {
  private _em: EventEmitter;
  private _hoverOverlay: HTMLElement;
  private _sheets: HTMLStyleElement[];
  private _stage: HTMLElement;
  private _mainStyleContainer: HTMLElement;
  private _virtualRootNode: any;
  readonly mount: HTMLElement;
  constructor(
    readonly protocol: string,
    private _targetUri: string,
    private _domFactory: DOMFactory = document
  ) {
    this._sheets = [];
    this._em = new EventEmitter();
    this._hoverOverlay = _domFactory.createElement("div");
    Object.assign(this._hoverOverlay.style, {
      position: "absolute",
      zIndex: 1024,
      display: "none",
      background: "rgba(124, 154, 236, 0.5)",
      width: `100px`,
      height: `100px`,
      pointerEvents: "none",
      top: `0px`,
      left: `0px`
    });

    this._stage = this._domFactory.createElement("div");
    this.mount = this._domFactory.createElement("div");
    this._mainStyleContainer = this._domFactory.createElement("div");
    this.mount.appendChild(this._mainStyleContainer);
    this.mount.appendChild(this._stage);
    this.mount.appendChild(this._hoverOverlay);
    this._stage.addEventListener("mousedown", this._onStageMouseDown, true);
    this._stage.addEventListener("mouseup", preventDefault, true);
    this._stage.addEventListener("mouseover", this._onStageMouseOver);
    this._stage.addEventListener("mouseout", this._onStageMouseOut);
  }

  onMetaClick = (listener: (element: any) => void) => {
    this._em.addListener(RenderEventTypes.META_CLICK, listener);
  };

  handleEngineEvent = (event: EngineEvent) => {
    switch (event.kind) {
      case EngineEventKind.Evaluated: {
        if (event.uri === this._targetUri) {
          removeAllChildren(this._stage);
          removeAllChildren(this._mainStyleContainer);
          this._virtualRootNode = event.info.preview;
          const node = createNativeNode(
            event.info.preview,
            this._domFactory,
            this.protocol,
            null
          );
          [];
          const sheet = createNativeStyleFromSheet(
            event.info.sheet,
            this._domFactory,
            this.protocol
          );
          this._mainStyleContainer.appendChild(sheet);
          this._stage.appendChild(node);
        }
        break;
      }
      case EngineEventKind.Diffed: {
        if (event.uri === this._targetUri) {
          patchNativeNode(
            this._stage,
            event.mutations,
            this._domFactory,
            this.protocol
          );
          this._virtualRootNode = patchVirtNode(
            this._virtualRootNode,
            event.mutations
          );
        }

        break;
      }
    }
  };

  private _onStageMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const element = event.target as Element;
    if (element.nodeType !== 1 || !event.metaKey) return;
    const nodePath = getNativeNodePath(this.mount, element);
    const virtNode = getVirtTarget(this._virtualRootNode, nodePath);
    if (!virtNode) return;
    this._em.emit(RenderEventTypes.META_CLICK, virtNode);
  };

  private _onStageMouseOver = (event: MouseEvent) => {
    const element = event.target as Element;
    const elementWindow = element.ownerDocument.defaultView;
    if (element.nodeType !== 1 || !event.metaKey) return;
    const rect = element.getBoundingClientRect();
    Object.assign(this._hoverOverlay.style, {
      display: "block",
      left: `${elementWindow.document.body.scrollLeft + rect.left}px`,
      top: `${elementWindow.document.body.scrollTop + rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
  };

  private _onStageMouseOut = (event: MouseEvent) => {
    const element = event.target as Node;
    if (element.nodeType !== 1) return;
    Object.assign(this._hoverOverlay.style, {
      display: "none"
    });
  };
}

const removeAllChildren = (node: HTMLElement) => {
  while (node.childNodes.length) {
    node.removeChild(node.childNodes[0]);
  }
};
