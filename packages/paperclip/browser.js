import { createEngine as createEngine2 } from "./lib";

export const createEngine = createEngine2(async (...args) => {
  return import("./native/bundler").then(({ NativeEngine }) => {
    return NativeEngine.new(...args);
  });
});
