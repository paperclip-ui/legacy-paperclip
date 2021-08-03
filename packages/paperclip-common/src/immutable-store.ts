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
  bind(listener: (state: TState) => void) {
    listener(this.getState());
    return this.onChange(listener);
  }
  onChange(listener: (newState: TState, oldState: TState) => void) {
    this._em.on("change", listener);
    return () => this._em.off("change", listener);
  }
  update(updater: (state: TState) => void) {
    const newState = produce(this._state, updater);

    if (this._state !== newState) {
      const oldState = this._state;
      this._state = newState;
      this._em.emit("change", newState, oldState);
    }
  }
}
