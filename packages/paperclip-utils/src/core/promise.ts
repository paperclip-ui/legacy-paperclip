const deferPromise = () => {
  let _resolve;

  const promise = new Promise(resolve => {
    _resolve = resolve;
  });

  return [promise, _resolve];
};
