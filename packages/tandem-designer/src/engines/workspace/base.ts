import { EventEmitter } from "stream";

export class AreaManager {
  private _em: EventEmitter;
  protected _addListener(type: string, listener: (...args: any[]) => void) {
    this._em.on(type, listener);
    return () => this._em.off(type, listener);
  }
  protected _emit(type: string, ...args: any[]) {
    this._em.emit(type, ...args);
  }
}
