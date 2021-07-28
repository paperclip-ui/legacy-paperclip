import { createEngineDelegate } from "paperclip";
import { EngineDelegate, EngineMode } from "paperclip";
import { BaseEvent, eventProcesses } from "../core/events";
import { ServerKernel } from "../core/kernel";
import { ServiceInitialized } from "../core/service-manager";

export class PCEngineCrashed implements BaseEvent {
  static TYPE = "PCEngineEventType/CRASHED";
  readonly type = PCEngineCrashed.TYPE;
}

export class PCEngineInitialized implements BaseEvent {
  static TYPE = "PCEngineEventType/INITIALIZED";
  readonly type = PCEngineInitialized.TYPE;
  constructor(readonly engine: EngineDelegate) {}
}

export const pcEngineService = () => (kernel: ServerKernel) => {
  kernel.events.observe({
    onEvent: eventProcesses({
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
