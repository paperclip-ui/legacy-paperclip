export const deferPromise = <TRet>(): [Promise<TRet>, (ret: TRet) => void] => {
  let _resolve;

  const promise = new Promise<TRet>(resolve => {
    _resolve = resolve;
  });

  return [promise, _resolve];
};
