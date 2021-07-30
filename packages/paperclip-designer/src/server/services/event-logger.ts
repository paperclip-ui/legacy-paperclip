import { BaseEvent } from "paperclip-common";
import { ServerKernel } from "../core/kernel";

export const eventLogger = () => (kernel: ServerKernel) => {
  const handleEvent = (event: BaseEvent) => {
    console.log(`event: ${event.type}`);
  };
  kernel.events.observe({
    handleEvent
  });
};
