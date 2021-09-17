import { BaseEvent, ServerKernel } from "paperclip-common";

export const eventLogger = () => (kernel: ServerKernel) => {
  const handleEvent = (event: BaseEvent) => {
    console.log(`event: ${event.type}`);
  };
  kernel.events.observe({
    handleEvent
  });
};
