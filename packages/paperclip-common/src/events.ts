import { Disposable } from "./disposable";

export type BaseEvent = {
  type: string;
};

export type Dispatcher = (event: BaseEvent) => void;

type EventHandler = (event: BaseEvent) => void;

export type Observer = {
  handleEvent: EventHandler;
};

class ObservablePipe implements Observer {
  constructor(private _dest: Observable) {}
  handleEvent(event: BaseEvent) {
    this._dest.dispatch(event);
  }
}

export class Observable {
  private _observers: Observer[];
  constructor() {
    this._observers = [];
  }
  dispatch(event: BaseEvent) {
    for (let i = this._observers.length; i--; ) {
      this._observers[i].handleEvent(event);
    }
  }
  pipe(observable: Observable) {
    return this.observe(new ObservablePipe(observable));
  }
  source(observable: Observable) {
    return observable.pipe(this);
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

export type EventProcessCreator = (
  event: BaseEvent
) => Disposable | Promise<Disposable>;

export const eventHandler = (
  type: string,
  handler: (event: BaseEvent) => void
) => (event: BaseEvent) => {
  if (event.type === type) {
    handler(event);
  }
};

export const eventHandlers = (
  handlers: Record<string, (event: BaseEvent) => void>
) => (event: BaseEvent) => {
  if (handlers[event.type]) {
    handlers[event.type](event);
  }
};

export const eventProcesses = (
  handlers: Record<string, EventProcessCreator>
): EventHandler => {
  const processes: Record<string, Disposable | Promise<Disposable>> = {};

  return async (event: BaseEvent) => {
    const handleEvent = handlers[event.type];
    if (handleEvent) {
      // NOTE - this is problematic if other events come in - we want to use
      // something like take latest
      if (processes[event.type]) {
        (await processes[event.type]).dispose();
      }
      processes[event.type] = handleEvent(event);
    }
  };
};

type EventCreator<TEvent extends BaseEvent> = () => TEvent;
