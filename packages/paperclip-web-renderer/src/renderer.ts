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
  private _dependencies: string[] = [];
  private _stage: HTMLElement;
  private _importedStyles: Record<string, HTMLElement>;
  private _mainStyleContainer: HTMLElement;
  private _importedStylesContainer: HTMLElement;
  private _virtualRootNode: any;
  readonly mount: HTMLElement;
  constructor(
    readonly protocol: string,
    readonly targetUri: string,
    private _domFactory: DOMFactory = document
  ) {
    this._sheets = [];
    this._importedStyles = {};
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
    this._importedStylesContainer = this._domFactory.createElement("div");
    this.mount.appendChild(this._importedStylesContainer);
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

  initialize({ sheet, preview, importedSheets }) {
    removeAllChildren(this._stage);
    removeAllChildren(this._mainStyleContainer);
    removeAllChildren(this._importedStylesContainer);
    this._virtualRootNode = preview;
    const node = createNativeNode(
      preview,
      this._domFactory,
      this.protocol,
      null
    );

    this._dependencies = Object.keys(importedSheets);
    this._addSheets(importedSheets);
    const style = createNativeStyleFromSheet(
      sheet,
      this._domFactory,
      this.protocol
    );
    this._mainStyleContainer.appendChild(style);
    this._stage.appendChild(node);
  }

  private _addSheets(importedSheets: Record<string, any>) {
    for (const impUri in importedSheets) {
      const impSheet = importedSheets[impUri];
      const sheet = createNativeStyleFromSheet(
        impSheet,
        this._domFactory,
        this.protocol
      );
      this._importedStyles[impUri] = sheet;
      this._importedStylesContainer.appendChild(sheet);
    }
  }

  handleEngineEvent = (event: EngineEvent) => {
    switch (event.kind) {
      case EngineEventKind.AddedSheets: {
        if (event.uri === this.targetUri) {
          this._dependencies = event.allDependencies;
          this._addSheets(event.sheets);
        }
        break;
      }
      case EngineEventKind.Loaded: {
        if (event.uri === this.targetUri) {
          this.initialize(event);
        }
        break;
      }
      case EngineEventKind.Evaluated: {
        if (event.uri === this.targetUri) {
          this._dependencies = event.allDependencies;
        } else if (this._dependencies.includes(event.uri)) {
          const impStyle = this._importedStyles[event.uri];
          if (impStyle) {
            impStyle.remove();
          }
          const style = (this._importedStyles[
            event.uri
          ] = createNativeStyleFromSheet(
            event.info.sheet,
            this._domFactory,
            this.protocol
          ));

          this._importedStylesContainer.appendChild(style);
        }
        break;
      }
      case EngineEventKind.Diffed: {
        if (event.uri === this.targetUri) {
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

          if (event.sheet) {
            removeAllChildren(this._mainStyleContainer);
            const sheet = createNativeStyleFromSheet(
              event.sheet,
              this._domFactory,
              this.protocol
            );
            this._mainStyleContainer.appendChild(sheet);
          }

          for (const importedSheetUri in this._importedStyles) {
            if (!event.allDependencies.includes(importedSheetUri)) {
              const sheet = this._importedStyles[importedSheetUri];
              sheet.remove();
              delete this._importedStyles[importedSheetUri];
            }
          }
        } else if (event.sheet) {
          // this._importedStylesContainer.appendChild(createNativeStyleFromSheet(event.sheet, this._domFactory, this.protocol));
          const impStyle = this._importedStyles[event.uri];
          if (impStyle) {
            impStyle.remove();
          }

          const element = (this._importedStyles[
            event.uri
          ] = createNativeStyleFromSheet(
            event.sheet,
            this._domFactory,
            this.protocol
          ));

          this._importedStylesContainer.appendChild(element);
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
