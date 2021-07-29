import { BaseEvent } from "paperclip-common";
import { ServerKernel } from "../core/kernel";

export const eventLogger = () => (kernel: ServerKernel) => {
  const onEvent = (event: BaseEvent) => {
    console.log(`event: ${event.type}`);
  };
  kernel.events.observe({
    onEvent
  });
};
