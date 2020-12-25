const { NativeEngine } = require("./native/node/paperclip");
const {
  createEngine,
  createEngineSync,
  createEngineDelegate,
  createEngineDelegateSync,
  ...rest
} = require("./lib");

const creator = (...args) => {
  return NativeEngine.new(...args);
};

module.exports = {
  createEngine: createEngine(creator),
  createEngineSync: createEngineSync(creator),
  createEngineDelegate: createEngineDelegate(creator),
  createEngineDelegateSync: createEngineDelegateSync(creator),
  ...rest
};
