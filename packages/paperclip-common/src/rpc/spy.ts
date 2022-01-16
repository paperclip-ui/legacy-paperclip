export const spy = (obj, prop, handler) => {
  const oldProp = obj[prop];

  let spyFn;

  // spy exists? Use that
  if (oldProp?.callbacks) {
    spyFn = oldProp;
  } else {
    const callbacks = [];
    spyFn = (...args) => {
      for (const cb of callbacks) {
        cb && cb(...args);
      }
    };
    spyFn.callbacks = callbacks;
  }

  spyFn.callbacks.push(handler);

  obj[prop] = spyFn;

  return () => {
    if (spyFn.callbacks.length === 1) {
      obj[prop] = spyFn[spyFn.callbacks[0]];
    } else {
      const i = spyFn.callbacks.indexOf(handler);
      if (i !== -1) {
        spyFn.callbacks.splice(i, 1);
      }
    }
  };
};
