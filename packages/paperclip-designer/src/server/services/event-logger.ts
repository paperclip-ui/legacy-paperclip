import { BaseEvent } from "../core/events";
import { ServerKernel } from "../core/kernel";

export const eventLogger = () => ({ connect });
const connect = (kernel: ServerKernel) => {
  const onEvent = (event: BaseEvent) => {
    console.log(`event: ${event.type}`);
  };
  kernel.events.observe({
    onEvent
  });
};
