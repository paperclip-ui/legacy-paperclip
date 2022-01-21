const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.setImmediate = (fn) => setTimeout(fn, 0);
