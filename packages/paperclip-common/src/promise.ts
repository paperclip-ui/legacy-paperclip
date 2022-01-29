export class Deferred<TType> {
  private _promise: Promise<TType>;
  private _resolve: (value: TType) => void;
  private _reject: (any) => void;
  constructor() {
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
  get promise() {
    return this._promise;
  }
  get resolve() {
    return this._resolve;
  }
  get reject() {
    return this._reject;
  }
}

export const deferPromise = <TValue>(): [
  Promise<TValue>,
  (value: TValue) => void
] => {
  let _resolve;

  const promise = new Promise<TValue>((resolve) => {
    _resolve = resolve;
  });

  return [promise, _resolve];
};
