import { Disposable } from "./disposable";

export type BaseEvent<TType extends string> = {
  type: TType;
};

export type Dispatcher = (event: BaseEvent<any>) => void;

export type Observer = {
  onEvent: (event: BaseEvent<any>) => void;
};

export class Observable {
  private _observers: Observer[];
  constructor() {
    this._observers = [];
  }
  dispatch(event: BaseEvent<any>) {
    for (let i = this._observers.length; i--; ) {
      this._observers[i].onEvent(event);
    }
  }
  observe(observer: Observer): Disposable {
    this._observers.push(observer);
    return {
      dispose() {
        this.unobserve(observer);
      }
    };
  }
  unobserve(observer: Observer) {
    const index = this._observers.indexOf(observer);
    if (index !== -1) {
      this._observers.splice(index, 1);
    }
  }
}
