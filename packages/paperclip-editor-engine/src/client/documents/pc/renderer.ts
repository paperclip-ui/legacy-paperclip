import { EngineDelegateEvent, LoadedPCData } from "@paperclip-ui/core";
import {
  FramesRenderer,
  FramesRendererState
} from "@paperclip-ui/web-renderer";
import { EditorClientOptions } from "../../client";
import { EventEmitter } from "events";
import { PCDocument, PCDocumentContent } from "./index";
import { createListener } from "../../../core/utils";

export class FrameRenderingManager {
  private _renderer: FramesRenderer;
  private _em: EventEmitter;
  private _disposeContentLoadedListener: () => void;
  private _disposeOnAppliedChangesListener: () => void;
  constructor(private _document: PCDocument, options: EditorClientOptions) {
    this._em = new EventEmitter();
    this._renderer = new FramesRenderer(
      this._document.uri,
      this._resolveUrl,
      options.domFactory || document,
      this._onChange
    );
    const content = this._document.getContent();
    if (content) {
      this._renderer.initialize(content);
    }
    this._disposeContentLoadedListener = this._document.onContentLoaded(
      this._onDocumentContentLoaded
    );
    this._disposeOnAppliedChangesListener = this._document.onAppliedChanges(
      this._onDocumentAppliedChanges
    );
  }
  private _resolveUrl = (uri: string) => {
    return uri;
  };
  dispose() {
    this._disposeContentLoadedListener();
    this._disposeOnAppliedChangesListener();
  }
  private _onDocumentContentLoaded = (content: PCDocumentContent) => {
    this._renderer.initialize(content);
  };
  private _onDocumentAppliedChanges = (
    content: PCDocumentContent,
    event: EngineDelegateEvent
  ) => {
    this._renderer.handleEngineDelegateEvent(event);
  };
  onChange(listener: (state: FramesRendererState) => void) {
    return createListener(this._em, "change", listener);
  }
  private _onChange = (newState: FramesRendererState) => {
    this._em.emit("change", newState);
  };
  getState() {
    return this._renderer.getState();
  }
}
