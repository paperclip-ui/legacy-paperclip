const { NativeEngine } = require("./native/node/paperclip");
const {
  createEngine,
  createEngineSync,
  createEngineDelegate,
  ...rest
} = require("./lib");

const creator = (...args) => {
  return NativeEngine.new(...args);
};

module.exports = {
  createEngine: createEngine(creator),
  createEngineSync: createEngineSync(creator),
  createEngineDelegate: createEngineDelegate(creator),
  ...rest
};
