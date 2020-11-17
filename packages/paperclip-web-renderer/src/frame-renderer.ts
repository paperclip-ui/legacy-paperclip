/**
 * https://github.com/crcn/paperclip/issues/523#issuecomment-729103732
 */

import { Engine, EngineEvent } from "paperclip";
import { EventEmitter } from "events";

export type Frame = {
  title: string;
  left: number;
  top: number;
  width: number;
  height: number;
  element: HTMLIFrameElement;
};

export class FrameRenderer {
  private _disposeEngineEvent: () => void;
  private _emitter: EventEmitter;
  private _frames: Frame[];
  constructor(private _engine: Engine) {
    this._emitter = new EventEmitter();
    this._frames = [];
    this._disposeEngineEvent = _engine.onEvent(this._onEngineEvent);
  }
  onChange(changeListener: () => void): void {
    this._emitter.on("change", changeListener);
  }
  _onEngineEvent = (event: EngineEvent): void => {
    // TODO - do stuff
  };
  dispose(): void {
    this._disposeEngineEvent();
  }
}
