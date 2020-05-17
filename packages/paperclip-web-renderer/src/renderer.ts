import {
  createNativeNode,
  DOMNodeMap,
  getNativeNodePath
} from "./native-renderer";
import {
  Node as VirtNode,
  EngineEvent,
  EngineEventKind
} from "paperclip-utils";
import { EventEmitter } from "events";
import { preventDefault } from "./utils";
import { getVirtTarget, patchVirtNode } from "./virt-patcher";
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
  private _stage: HTMLElement;
  private _virtualRootNode: any;
  readonly mount: HTMLElement;
  constructor(
    readonly protocol: string,
    private _domFactory: DOMFactory = document
  ) {
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
        while (this._stage.childNodes.length) {
          this._stage.removeChild(this._stage.childNodes[0]);
        }
        this._virtualRootNode = event.node;
        const node = createNativeNode(
          event.node,
          this._domFactory,
          this.protocol,
          null
        );
        this._stage.appendChild(node);
        break;
      }
      case EngineEventKind.Diffed: {
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
