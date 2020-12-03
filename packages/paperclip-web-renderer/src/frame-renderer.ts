/**
 * https://github.com/crcn/paperclip/issues/523#issuecomment-729103732
 */

import { Engine, EngineDelegateEvent } from "paperclip";
import { EventEmitter } from "events";
import { EngineDelegate } from "paperclip/src";
import { DOMFactory } from "./renderer";

export type Frame = {
  title: string;
  left: number;
  top: number;
  width: number;
  height: number;
  element: HTMLIFrameElement;
};

export class FrameRenderer {
  private _disposeEngineDelegateEvent: () => void;
  private _emitter: EventEmitter;
  private _frames: Frame[];
  constructor(
    private _engineController: EngineDelegate,
    private _protocol: string,
    private _domFactory: DOMFactory
  ) {
    this._emitter = new EventEmitter();
    this._frames = [];
  }
  onChange(changeListener: () => void): void {
    this._emitter.on("change", changeListener);
  }
  _onEngineDelegateEvent = (event: EngineDelegateEvent): void => {
    console.log(event);
    // TODO - do stuff
    console.log("ENGINE EVENT");
  };
  dispose(): void {
    this._disposeEngineDelegateEvent();
  }
}
