import { EventEmitter } from "events";
import { produce } from "immer";
import { isEqual } from "lodash";

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
  bind<TSelectedValue extends any = TState>(
    listener: (state: TSelectedValue) => void,
    select: (state: TState) => TSelectedValue = identity
  ) {
    listener(select(this.getState()));
    return this.onChange(listener, select);
  }
  onChange<TSelectedValue extends any = TState>(
    listener: (newState: TSelectedValue, oldState: TSelectedValue) => void,
    select: (state: TState) => TSelectedValue = identity
  ) {
    const onChange = (newState: TState, oldState: TState) => {
      const newValue = select(newState);
      const oldValue = select(oldState);
      if (!isEqual(newValue, oldValue)) {
        listener(newValue, oldValue);
      }
    };

    this._em.on("change", onChange);
    return () => this._em.off("change", onChange);
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

const identity = (v) => v;
