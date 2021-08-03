import { BaseEvent, Observer } from "paperclip-common";
import { BaseServerKernel } from "./kernel";

export class ServiceInitialized implements BaseEvent {
  static TYPE = "ServiceEvent/INITIALIZED";
  readonly type = ServiceInitialized.TYPE;
}

export interface BaseServerState extends Observer {}

export const serviceCreator = <TKernel extends BaseServerKernel, TState>(
  load: (kernel: TKernel, state: TState) => void,
  createState?: () => TState
) => (kernel: TKernel) => {
  let state: TState;
  if (createState) {
    state = createState();
    if (((state as any) as Observer).handleEvent) {
      kernel.events.observe((state as any) as Observer);
    }
  }
  load(kernel, state);
};

export class ServiceManager<TKernel extends BaseServerKernel> {
  constructor(private _kernal: TKernel) {}
  add(...serviceCreators: Array<(kernel: TKernel) => void>) {
    serviceCreators.forEach(createService => {
      createService(this._kernal);
    });
    return this;
  }
  initialize() {
    this._kernal.events.dispatch(new ServiceInitialized());
  }
}
