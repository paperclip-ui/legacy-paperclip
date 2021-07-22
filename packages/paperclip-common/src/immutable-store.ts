import { EventEmitter } from "events";
import { produce } from "immer";

export class ImmutableStore<TState> {
  private _state: TState;
  private _em: EventEmitter;
  constructor(initialState: TState, bind?: (state: TState) => void) {
    this._state = { ...initialState };
    this._em = new EventEmitter();
    if (bind) {
      this.bind(bind);
    }
  }
  getState() {
    return this._state;
  }
  bind(listener: (TState) => void) {
    listener(this.getState());
    return this.onChange(listener);
  }
  onChange(listener: (TState) => void) {
    this._em.on("change", listener);
    return () => this._em.off("change", listener);
  }
  update(updater: (TState) => void) {
    const newState = produce(this._state, updater);

    if (this._state !== newState) {
      this._state = newState;
      this._em.emit("change", this._state);
    }
  }
}
