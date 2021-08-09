import { createEngineDelegate } from "paperclip";
import { EngineDelegate, EngineMode } from "paperclip";
import {
  BaseEvent,
  eventProcesses,
  ServerKernel,
  ServiceInitialized
} from "paperclip-common";

export class PCEngineCrashed implements BaseEvent {
  static TYPE = "PCEngineEventType/CRASHED";
  readonly type = PCEngineCrashed.TYPE;
  toJSON() {
    return { type: this.type };
  }
}

export class PCEngineInitialized implements BaseEvent {
  static TYPE = "PCEngineEventType/INITIALIZED";
  readonly type = PCEngineInitialized.TYPE;
  constructor(readonly engine: EngineDelegate) {}
}

export const pcEngineService = () => (kernel: ServerKernel) => {
  kernel.events.observe({
    handleEvent: eventProcesses({
      [ServiceInitialized.TYPE]: init(kernel)
    })
  });
};

const init = (kernel: ServerKernel) => async () => {
  const engine = await createEngineDelegate(
    {
      mode: EngineMode.MultiFrame
    },
    () => {
      kernel.events.dispatch(new PCEngineCrashed());
    }
  );

  kernel.events.dispatch(new PCEngineInitialized(engine));

  return {
    dispose() {}
  };
};
