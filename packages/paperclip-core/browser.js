import { EngineDelegate, EngineMode } from "./esm/core";

export { EngineMode };
export const loadEngineDelegate = async (options, onCrash) => {
  // need this here since webpack tree shakes it out
  await import("./native/browser/paperclip_bg.wasm");

  const { NativeEngine } = await import("./native/browser/paperclip_bg.js");
  const { readFile, fileExists, resolveFile, getLintConfig } = options.io || {};

  return new EngineDelegate(
    NativeEngine.new(
      readFile,
      fileExists,
      resolveFile,
      getLintConfig,
      options.mode || EngineMode.MultiFrame
    ),
    options.io,
    onCrash ||
      function (e) {
        console.error(e);
      }
  );
};
