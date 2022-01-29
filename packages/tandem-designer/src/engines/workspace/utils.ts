import { EventEmitter } from "stream";

export const eventListener = (
  em: EventEmitter,
  type: string,
  listener: any
) => {
  em.on(type, listener);
  return () => em.off(type, listener);
};
