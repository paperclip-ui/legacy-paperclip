import { EngineDelegate, EngineMode } from "./esm/core";

export const loadEngineDelegate = async (options, onCrash) => {
  // need this here since webpack tree shakes it out
  await import("./native/browser/paperclip_bg.wasm");

  const { NativeEngine } = await import("./native/browser/paperclip_bg");
  const { readFile, fileExists, resolveFile } = options.io;

  return new EngineDelegate(
    NativeEngine.new(
      readFile,
      fileExists,
      resolveFile,
      options.mode || EngineMode.MultiFrame
    ),
    readFile,
    onCrash ||
      function(e) {
        console.error(e);
      }
  );
};
