// import { EventEmitter } from "events";

export const deferPromise = <TRet>(): [Promise<TRet>, (ret: TRet) => void] => {
  let _resolve;

  const promise = new Promise<TRet>((resolve) => {
    _resolve = resolve;
  });

  return [promise, _resolve];
};

export const createListener = (
  em: any,
  type: string,
  listener: (...args: any[]) => void
) => {
  em.on(type, listener);
  return () => em.off(type, listener);
};
