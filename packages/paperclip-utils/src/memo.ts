import * as LRU from "lru-cache";

const DEFAULT_LRU_MAX = 10000;

// need this for default arguments
const getArgumentCount = (fn: (...args: any[]) => any) => {
  const str = fn.toString();
  const params = str.match(/\(.*?\)|\w+\s*=>/)[0];
  const args = params
    .replace(/[=>()]/g, "")
    .split(/\s*,\s*/)
    .filter(arg => arg.substr(0, 3) !== "...");

  return args.length;
};

export const memoize = <TFunc extends (...args: any[]) => any>(
  fn: TFunc,
  lruMax: number = DEFAULT_LRU_MAX,
  argumentCount: number = getArgumentCount(fn)
) => {
  if (argumentCount == Infinity || isNaN(argumentCount)) {
    throw new Error(`Argument count cannot be Infinity, 0, or NaN.`);
  }

  if (!argumentCount) {
    console.error(`Argument count should not be 0. Defaulting to 1.`);
    argumentCount = 1;
  }

  return compilFastMemoFn(argumentCount, lruMax > 0)(
    fn,
    new LRU({ max: lruMax })
  ) as TFunc;
};

export const shallowEquals = (a, b) => {
  const toa = typeof a;
  const tob = typeof b;

  if (toa !== tob) {
    return false;
  }

  if (toa !== "object" || !a || !b) {
    return a === b;
  }

  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  for (const key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
};

export const reuser = <TValue>(
  lruMax: number = DEFAULT_LRU_MAX,
  getKey: (value: TValue) => string,
  equals: (a: TValue, b: TValue) => boolean = shallowEquals
): ((value: TValue) => TValue) => {
  const cache = new LRU({ max: lruMax });
  return (value: TValue) => {
    const key = getKey(value);
    if (!cache.has(key) || !equals(cache.get(key), value)) {
      cache.set(key, value);
    }

    return cache.get(key);
  };
};

const _memoFns: any = {};

const compilFastMemoFn = (argumentCount: number, acceptPrimitives: boolean) => {
  const hash = "" + argumentCount + acceptPrimitives;
  if (_memoFns[hash]) {
    return _memoFns[hash];
  }

  const args = Array.from({ length: argumentCount }).map((v, i) => `arg${i}`);

  let buffer = `
  return function(fn, keyMemo) {
    var memo = new WeakMap();
    return function(${args.join(", ")}) {
      var currMemo = memo, prevMemo, key;
  `;

  for (let i = 0, n = args.length - 1; i < n; i++) {
    const arg = args[i];
    buffer += `
      prevMemo = currMemo;
      key      = ${arg};
      ${
        acceptPrimitives
          ? `if ((typeof key !== "object" || !key) && !(key = keyMemo.get(${arg}))) {
        keyMemo.set(${arg}, key = {});
      }`
          : ""
      }
      if (!(currMemo = currMemo.get(key))) {
        prevMemo.set(key, currMemo = new WeakMap());
      }
    `;
  }

  const lastArg = args[args.length - 1];

  buffer += `
      key = ${lastArg};
      ${
        acceptPrimitives
          ? `
      if ((typeof key !== "object" || !key) && !(key = keyMemo.get(${lastArg}))) {
        keyMemo.set(${lastArg}, key = {});
      }`
          : ""
      }

      if (!currMemo.has(key)) {
        try {
          currMemo.set(key, fn(${args.join(", ")}));
        } catch(e) {
          throw e;
        }
      }

      return currMemo.get(key);
    };
  };
  `;

  return (_memoFns[hash] = new Function(buffer)());
};

/**
 * Calls target function once & proxies passed functions
 * @param fn
 */

export const underchange = <TFunc extends (...args: any[]) => any>(
  fn: TFunc
) => {
  let currentArgs = [];
  let ret: any;
  let started: boolean;

  const start = () => {
    if (started) {
      return ret;
    }
    started = true;
    return (ret = fn(
      ...currentArgs.map((a, i) => (...args) => currentArgs[i](...args))
    ));
  };

  return (((...args) => {
    currentArgs = args;
    return start();
  }) as any) as TFunc;
};
