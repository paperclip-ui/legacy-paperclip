const { NativeEngine } = require("./native/bundler/paperclip");
const { createEngine, ...rest } = require("./lib");

module.exports = {
  createEngine: createEngine(NativeEngine),
  ...rest
};
