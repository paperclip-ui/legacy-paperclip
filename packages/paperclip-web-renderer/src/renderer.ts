import { createNativeNode, DOMNodeMap } from "./native-renderer";
// import { Node as VirtNode } from "paperclip";
import { EventEmitter } from "events";
import { preventDefault } from "./utils";

enum RenderEventTypes {
  META_CLICK = "META_CLICK"
}

export class Renderer {
  private _scopeFilePath: string;
  private _nativeNodeMap: DOMNodeMap;
  private _em: EventEmitter;
  private _hoverOverlay: HTMLElement;
  private _stage: HTMLElement;
  private _virtualRootNode: any;
  readonly mount: HTMLDivElement;
  constructor(readonly protocol: string) {
    this._em = new EventEmitter();
    this._hoverOverlay = document.createElement("div");
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

    this._stage = document.createElement("div");
    this.mount = document.createElement("div");
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

  handleEngineEvent(event) {
    // only accept events scoped to current file path
    if (event.kind !== "Evaluated" && event.file_path !== this._scopeFilePath) {
      return;
    }
    switch (event.kind) {
      case "Evaluated": {
        while (this._stage.childNodes.length) {
          this._stage.removeChild(this._stage.childNodes[0]);
        }
        this._scopeFilePath = event.file_path;
        this._virtualRootNode = event.node;
        this._nativeNodeMap = new Map();
        const node = createNativeNode(
          event.node,
          this.protocol,
          this._nativeNodeMap
        );
        this._stage.appendChild(node);
      }
      case "Diffed": {
        // TODO
      }
    }
  }

  private _onStageMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const element = event.target as Element;
    const targetId = this._nativeNodeMap.get(element);
    if (element.nodeType !== 1 || !targetId || !event.metaKey) return;
    const virtNode = findVirtNodeById(targetId, this._virtualRootNode);
    if (!virtNode) return;
    this._em.emit(RenderEventTypes.META_CLICK, virtNode);
  };

  private _onStageMouseOver = (event: MouseEvent) => {
    const element = event.target as Element;
    const targetId = this._nativeNodeMap.get(element);
    if (element.nodeType !== 1 || !event.metaKey || !targetId) return;
    const rect = element.getBoundingClientRect();
    Object.assign(this._hoverOverlay.style, {
      display: "block",
      left: `${window.scrollX + rect.left}px`,
      top: `${window.scrollY + rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
  };

  private _onStageMouseOut = (event: MouseEvent) => {
    const element = event.target as Node;
    if (element.nodeType !== 1) return;
    // const targetId = this._nativeNodeMap.get(element);
    Object.assign(this._hoverOverlay.style, {
      display: "none"
    });
  };
}

// TODO - move to paperclip lib
const findVirtNodeById = (id: string, node) => {
  if (node.id === id) {
    return node;
  }
  if (node.kind === "Element" || node.kind === "Fragment") {
    for (const child of node.children) {
      let ret = findVirtNodeById(id, child);
      if (ret) return ret;
    }
  }
  return null;
};
