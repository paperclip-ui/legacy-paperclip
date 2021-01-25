/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/crc32/lib/crc32.js":
/*!*********************************************!*\
  !*** ../../node_modules/crc32/lib/crc32.js ***!
  \*********************************************/
/***/ ((module) => {

(function () {
	'use strict';

	var table = [],
		poly = 0xEDB88320; // reverse polynomial

	// build the table
	function makeTable() {
		var c, n, k;

		for (n = 0; n < 256; n += 1) {
			c = n;
			for (k = 0; k < 8; k += 1) {
				if (c & 1) {
					c = poly ^ (c >>> 1);
				} else {
					c = c >>> 1;
				}
			}
			table[n] = c >>> 0;
		}
	}

	function strToArr(str) {
		// sweet hack to turn string into a 'byte' array
		return Array.prototype.map.call(str, function (c) {
			return c.charCodeAt(0);
		});
	}

	/*
	 * Compute CRC of array directly.
	 *
	 * This is slower for repeated calls, so append mode is not supported.
	 */
	function crcDirect(arr) {
		var crc = -1, // initial contents of LFBSR
			i, j, l, temp;

		for (i = 0, l = arr.length; i < l; i += 1) {
			temp = (crc ^ arr[i]) & 0xff;

			// read 8 bits one at a time
			for (j = 0; j < 8; j += 1) {
				if ((temp & 1) === 1) {
					temp = (temp >>> 1) ^ poly;
				} else {
					temp = (temp >>> 1);
				}
			}
			crc = (crc >>> 8) ^ temp;
		}

		// flip bits
		return crc ^ -1;
	}

	/*
	 * Compute CRC with the help of a pre-calculated table.
	 *
	 * This supports append mode, if the second parameter is set.
	 */
	function crcTable(arr, append) {
		var crc, i, l;

		// if we're in append mode, don't reset crc
		// if arr is null or undefined, reset table and return
		if (typeof crcTable.crc === 'undefined' || !append || !arr) {
			crcTable.crc = 0 ^ -1;

			if (!arr) {
				return;
			}
		}

		// store in temp variable for minor speed gain
		crc = crcTable.crc;

		for (i = 0, l = arr.length; i < l; i += 1) {
			crc = (crc >>> 8) ^ table[(crc ^ arr[i]) & 0xff];
		}

		crcTable.crc = crc;

		return crc ^ -1;
	}

	// build the table
	// this isn't that costly, and most uses will be for table assisted mode
	makeTable();

	module.exports = function (val, direct) {
		var val = (typeof val === 'string') ? strToArr(val) : val,
			ret = direct ? crcDirect(val) : crcTable(val);

		// convert to 2's complement hex
		return (ret >>> 0).toString(16);
	};
	module.exports.direct = crcDirect;
	module.exports.table = crcTable;
}());


/***/ }),

/***/ "../../node_modules/events/events.js":
/*!*******************************************!*\
  !*** ../../node_modules/events/events.js ***!
  \*******************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function eventListener() {
      if (errorListener !== undefined) {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };
    var errorListener;

    // Adding an error listener is not optional because
    // if an error is thrown on an event emitter we cannot
    // guarantee that the actual event we are waiting will
    // be fired. The result could be a silent way to create
    // memory or file descriptor leaks, which is something
    // we should avoid.
    if (name !== 'error') {
      errorListener = function errorListener(err) {
        emitter.removeListener(name, eventListener);
        reject(err);
      };

      emitter.once('error', errorListener);
    }

    emitter.once(name, eventListener);
  });
}


/***/ }),

/***/ "../../node_modules/fast-json-patch/index.mjs":
/*!****************************************************!*\
  !*** ../../node_modules/fast-json-patch/index.mjs ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "_areEquals": () => /* reexport safe */ _module_core_mjs__WEBPACK_IMPORTED_MODULE_0__._areEquals,
/* harmony export */   "applyOperation": () => /* reexport safe */ _module_core_mjs__WEBPACK_IMPORTED_MODULE_0__.applyOperation,
/* harmony export */   "applyPatch": () => /* reexport safe */ _module_core_mjs__WEBPACK_IMPORTED_MODULE_0__.applyPatch,
/* harmony export */   "applyReducer": () => /* reexport safe */ _module_core_mjs__WEBPACK_IMPORTED_MODULE_0__.applyReducer,
/* harmony export */   "getValueByPointer": () => /* reexport safe */ _module_core_mjs__WEBPACK_IMPORTED_MODULE_0__.getValueByPointer,
/* harmony export */   "validate": () => /* reexport safe */ _module_core_mjs__WEBPACK_IMPORTED_MODULE_0__.validate,
/* harmony export */   "validator": () => /* reexport safe */ _module_core_mjs__WEBPACK_IMPORTED_MODULE_0__.validator,
/* harmony export */   "compare": () => /* reexport safe */ _module_duplex_mjs__WEBPACK_IMPORTED_MODULE_1__.compare,
/* harmony export */   "generate": () => /* reexport safe */ _module_duplex_mjs__WEBPACK_IMPORTED_MODULE_1__.generate,
/* harmony export */   "observe": () => /* reexport safe */ _module_duplex_mjs__WEBPACK_IMPORTED_MODULE_1__.observe,
/* harmony export */   "unobserve": () => /* reexport safe */ _module_duplex_mjs__WEBPACK_IMPORTED_MODULE_1__.unobserve,
/* harmony export */   "JsonPatchError": () => /* reexport safe */ _module_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__.PatchError,
/* harmony export */   "deepClone": () => /* reexport safe */ _module_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__._deepClone,
/* harmony export */   "escapePathComponent": () => /* reexport safe */ _module_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__.escapePathComponent,
/* harmony export */   "unescapePathComponent": () => /* reexport safe */ _module_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__.unescapePathComponent,
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _module_core_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./module/core.mjs */ "../../node_modules/fast-json-patch/module/core.mjs");
/* harmony import */ var _module_duplex_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./module/duplex.mjs */ "../../node_modules/fast-json-patch/module/duplex.mjs");
/* harmony import */ var _module_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./module/helpers.mjs */ "../../node_modules/fast-json-patch/module/helpers.mjs");





/**
 * Default export for backwards compat
 */





/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Object.assign({}, _module_core_mjs__WEBPACK_IMPORTED_MODULE_0__, _module_duplex_mjs__WEBPACK_IMPORTED_MODULE_1__, {
    JsonPatchError: _module_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__.PatchError,
    deepClone: _module_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__._deepClone,
    escapePathComponent: _module_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__.escapePathComponent,
    unescapePathComponent: _module_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__.unescapePathComponent
}));

/***/ }),

/***/ "../../node_modules/fast-json-patch/module/core.mjs":
/*!**********************************************************!*\
  !*** ../../node_modules/fast-json-patch/module/core.mjs ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "JsonPatchError": () => /* binding */ JsonPatchError,
/* harmony export */   "deepClone": () => /* binding */ deepClone,
/* harmony export */   "getValueByPointer": () => /* binding */ getValueByPointer,
/* harmony export */   "applyOperation": () => /* binding */ applyOperation,
/* harmony export */   "applyPatch": () => /* binding */ applyPatch,
/* harmony export */   "applyReducer": () => /* binding */ applyReducer,
/* harmony export */   "validator": () => /* binding */ validator,
/* harmony export */   "validate": () => /* binding */ validate,
/* harmony export */   "_areEquals": () => /* binding */ _areEquals
/* harmony export */ });
/* harmony import */ var _helpers_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers.mjs */ "../../node_modules/fast-json-patch/module/helpers.mjs");

var JsonPatchError = _helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.PatchError;
var deepClone = _helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._deepClone;
/* We use a Javascript hash to store each
 function. Each hash entry (property) uses
 the operation identifiers specified in rfc6902.
 In this way, we can map each patch operation
 to its dedicated function in efficient way.
 */
/* The operations applicable to an object */
var objOps = {
    add: function (obj, key, document) {
        obj[key] = this.value;
        return { newDocument: document };
    },
    remove: function (obj, key, document) {
        var removed = obj[key];
        delete obj[key];
        return { newDocument: document, removed: removed };
    },
    replace: function (obj, key, document) {
        var removed = obj[key];
        obj[key] = this.value;
        return { newDocument: document, removed: removed };
    },
    move: function (obj, key, document) {
        /* in case move target overwrites an existing value,
        return the removed value, this can be taxing performance-wise,
        and is potentially unneeded */
        var removed = getValueByPointer(document, this.path);
        if (removed) {
            removed = (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._deepClone)(removed);
        }
        var originalValue = applyOperation(document, { op: "remove", path: this.from }).removed;
        applyOperation(document, { op: "add", path: this.path, value: originalValue });
        return { newDocument: document, removed: removed };
    },
    copy: function (obj, key, document) {
        var valueToCopy = getValueByPointer(document, this.from);
        // enforce copy by value so further operations don't affect source (see issue #177)
        applyOperation(document, { op: "add", path: this.path, value: (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._deepClone)(valueToCopy) });
        return { newDocument: document };
    },
    test: function (obj, key, document) {
        return { newDocument: document, test: _areEquals(obj[key], this.value) };
    },
    _get: function (obj, key, document) {
        this.value = obj[key];
        return { newDocument: document };
    }
};
/* The operations applicable to an array. Many are the same as for the object */
var arrOps = {
    add: function (arr, i, document) {
        if ((0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.isInteger)(i)) {
            arr.splice(i, 0, this.value);
        }
        else { // array props
            arr[i] = this.value;
        }
        // this may be needed when using '-' in an array
        return { newDocument: document, index: i };
    },
    remove: function (arr, i, document) {
        var removedList = arr.splice(i, 1);
        return { newDocument: document, removed: removedList[0] };
    },
    replace: function (arr, i, document) {
        var removed = arr[i];
        arr[i] = this.value;
        return { newDocument: document, removed: removed };
    },
    move: objOps.move,
    copy: objOps.copy,
    test: objOps.test,
    _get: objOps._get
};
/**
 * Retrieves a value from a JSON document by a JSON pointer.
 * Returns the value.
 *
 * @param document The document to get the value from
 * @param pointer an escaped JSON pointer
 * @return The retrieved value
 */
function getValueByPointer(document, pointer) {
    if (pointer == '') {
        return document;
    }
    var getOriginalDestination = { op: "_get", path: pointer };
    applyOperation(document, getOriginalDestination);
    return getOriginalDestination.value;
}
/**
 * Apply a single JSON Patch Operation on a JSON document.
 * Returns the {newDocument, result} of the operation.
 * It modifies the `document` and `operation` objects - it gets the values by reference.
 * If you would like to avoid touching your values, clone them:
 * `jsonpatch.applyOperation(document, jsonpatch._deepClone(operation))`.
 *
 * @param document The document to patch
 * @param operation The operation to apply
 * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
 * @param mutateDocument Whether to mutate the original document or clone it before applying
 * @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
 * @return `{newDocument, result}` after the operation
 */
function applyOperation(document, operation, validateOperation, mutateDocument, banPrototypeModifications, index) {
    if (validateOperation === void 0) { validateOperation = false; }
    if (mutateDocument === void 0) { mutateDocument = true; }
    if (banPrototypeModifications === void 0) { banPrototypeModifications = true; }
    if (index === void 0) { index = 0; }
    if (validateOperation) {
        if (typeof validateOperation == 'function') {
            validateOperation(operation, 0, document, operation.path);
        }
        else {
            validator(operation, 0);
        }
    }
    /* ROOT OPERATIONS */
    if (operation.path === "") {
        var returnValue = { newDocument: document };
        if (operation.op === 'add') {
            returnValue.newDocument = operation.value;
            return returnValue;
        }
        else if (operation.op === 'replace') {
            returnValue.newDocument = operation.value;
            returnValue.removed = document; //document we removed
            return returnValue;
        }
        else if (operation.op === 'move' || operation.op === 'copy') { // it's a move or copy to root
            returnValue.newDocument = getValueByPointer(document, operation.from); // get the value by json-pointer in `from` field
            if (operation.op === 'move') { // report removed item
                returnValue.removed = document;
            }
            return returnValue;
        }
        else if (operation.op === 'test') {
            returnValue.test = _areEquals(document, operation.value);
            if (returnValue.test === false) {
                throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
            }
            returnValue.newDocument = document;
            return returnValue;
        }
        else if (operation.op === 'remove') { // a remove on root
            returnValue.removed = document;
            returnValue.newDocument = null;
            return returnValue;
        }
        else if (operation.op === '_get') {
            operation.value = document;
            return returnValue;
        }
        else { /* bad operation */
            if (validateOperation) {
                throw new JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, document);
            }
            else {
                return returnValue;
            }
        }
    } /* END ROOT OPERATIONS */
    else {
        if (!mutateDocument) {
            document = (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._deepClone)(document);
        }
        var path = operation.path || "";
        var keys = path.split('/');
        var obj = document;
        var t = 1; //skip empty element - http://jsperf.com/to-shift-or-not-to-shift
        var len = keys.length;
        var existingPathFragment = undefined;
        var key = void 0;
        var validateFunction = void 0;
        if (typeof validateOperation == 'function') {
            validateFunction = validateOperation;
        }
        else {
            validateFunction = validator;
        }
        while (true) {
            key = keys[t];
            if (banPrototypeModifications && key == '__proto__') {
                throw new TypeError('JSON-Patch: modifying `__proto__` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README');
            }
            if (validateOperation) {
                if (existingPathFragment === undefined) {
                    if (obj[key] === undefined) {
                        existingPathFragment = keys.slice(0, t).join('/');
                    }
                    else if (t == len - 1) {
                        existingPathFragment = operation.path;
                    }
                    if (existingPathFragment !== undefined) {
                        validateFunction(operation, 0, document, existingPathFragment);
                    }
                }
            }
            t++;
            if (Array.isArray(obj)) {
                if (key === '-') {
                    key = obj.length;
                }
                else {
                    if (validateOperation && !(0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.isInteger)(key)) {
                        throw new JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", index, operation, document);
                    } // only parse key when it's an integer for `arr.prop` to work
                    else if ((0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.isInteger)(key)) {
                        key = ~~key;
                    }
                }
                if (t >= len) {
                    if (validateOperation && operation.op === "add" && key > obj.length) {
                        throw new JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", index, operation, document);
                    }
                    var returnValue = arrOps[operation.op].call(operation, obj, key, document); // Apply patch
                    if (returnValue.test === false) {
                        throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
                    }
                    return returnValue;
                }
            }
            else {
                if (key && key.indexOf('~') != -1) {
                    key = (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.unescapePathComponent)(key);
                }
                if (t >= len) {
                    var returnValue = objOps[operation.op].call(operation, obj, key, document); // Apply patch
                    if (returnValue.test === false) {
                        throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
                    }
                    return returnValue;
                }
            }
            obj = obj[key];
        }
    }
}
/**
 * Apply a full JSON Patch array on a JSON document.
 * Returns the {newDocument, result} of the patch.
 * It modifies the `document` object and `patch` - it gets the values by reference.
 * If you would like to avoid touching your values, clone them:
 * `jsonpatch.applyPatch(document, jsonpatch._deepClone(patch))`.
 *
 * @param document The document to patch
 * @param patch The patch to apply
 * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
 * @param mutateDocument Whether to mutate the original document or clone it before applying
 * @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
 * @return An array of `{newDocument, result}` after the patch
 */
function applyPatch(document, patch, validateOperation, mutateDocument, banPrototypeModifications) {
    if (mutateDocument === void 0) { mutateDocument = true; }
    if (banPrototypeModifications === void 0) { banPrototypeModifications = true; }
    if (validateOperation) {
        if (!Array.isArray(patch)) {
            throw new JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
        }
    }
    if (!mutateDocument) {
        document = (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._deepClone)(document);
    }
    var results = new Array(patch.length);
    for (var i = 0, length_1 = patch.length; i < length_1; i++) {
        // we don't need to pass mutateDocument argument because if it was true, we already deep cloned the object, we'll just pass `true`
        results[i] = applyOperation(document, patch[i], validateOperation, true, banPrototypeModifications, i);
        document = results[i].newDocument; // in case root was replaced
    }
    results.newDocument = document;
    return results;
}
/**
 * Apply a single JSON Patch Operation on a JSON document.
 * Returns the updated document.
 * Suitable as a reducer.
 *
 * @param document The document to patch
 * @param operation The operation to apply
 * @return The updated document
 */
function applyReducer(document, operation, index) {
    var operationResult = applyOperation(document, operation);
    if (operationResult.test === false) { // failed test
        throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
    }
    return operationResult.newDocument;
}
/**
 * Validates a single operation. Called from `jsonpatch.validate`. Throws `JsonPatchError` in case of an error.
 * @param {object} operation - operation object (patch)
 * @param {number} index - index of operation in the sequence
 * @param {object} [document] - object where the operation is supposed to be applied
 * @param {string} [existingPathFragment] - comes along with `document`
 */
function validator(operation, index, document, existingPathFragment) {
    if (typeof operation !== 'object' || operation === null || Array.isArray(operation)) {
        throw new JsonPatchError('Operation is not an object', 'OPERATION_NOT_AN_OBJECT', index, operation, document);
    }
    else if (!objOps[operation.op]) {
        throw new JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, document);
    }
    else if (typeof operation.path !== 'string') {
        throw new JsonPatchError('Operation `path` property is not a string', 'OPERATION_PATH_INVALID', index, operation, document);
    }
    else if (operation.path.indexOf('/') !== 0 && operation.path.length > 0) {
        // paths that aren't empty string should start with "/"
        throw new JsonPatchError('Operation `path` property must start with "/"', 'OPERATION_PATH_INVALID', index, operation, document);
    }
    else if ((operation.op === 'move' || operation.op === 'copy') && typeof operation.from !== 'string') {
        throw new JsonPatchError('Operation `from` property is not present (applicable in `move` and `copy` operations)', 'OPERATION_FROM_REQUIRED', index, operation, document);
    }
    else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && operation.value === undefined) {
        throw new JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_REQUIRED', index, operation, document);
    }
    else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.hasUndefined)(operation.value)) {
        throw new JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED', index, operation, document);
    }
    else if (document) {
        if (operation.op == "add") {
            var pathLen = operation.path.split("/").length;
            var existingPathLen = existingPathFragment.split("/").length;
            if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
                throw new JsonPatchError('Cannot perform an `add` operation at the desired path', 'OPERATION_PATH_CANNOT_ADD', index, operation, document);
            }
        }
        else if (operation.op === 'replace' || operation.op === 'remove' || operation.op === '_get') {
            if (operation.path !== existingPathFragment) {
                throw new JsonPatchError('Cannot perform the operation at a path that does not exist', 'OPERATION_PATH_UNRESOLVABLE', index, operation, document);
            }
        }
        else if (operation.op === 'move' || operation.op === 'copy') {
            var existingValue = { op: "_get", path: operation.from, value: undefined };
            var error = validate([existingValue], document);
            if (error && error.name === 'OPERATION_PATH_UNRESOLVABLE') {
                throw new JsonPatchError('Cannot perform the operation from a path that does not exist', 'OPERATION_FROM_UNRESOLVABLE', index, operation, document);
            }
        }
    }
}
/**
 * Validates a sequence of operations. If `document` parameter is provided, the sequence is additionally validated against the object document.
 * If error is encountered, returns a JsonPatchError object
 * @param sequence
 * @param document
 * @returns {JsonPatchError|undefined}
 */
function validate(sequence, document, externalValidator) {
    try {
        if (!Array.isArray(sequence)) {
            throw new JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
        }
        if (document) {
            //clone document and sequence so that we can safely try applying operations
            applyPatch((0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._deepClone)(document), (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._deepClone)(sequence), externalValidator || true);
        }
        else {
            externalValidator = externalValidator || validator;
            for (var i = 0; i < sequence.length; i++) {
                externalValidator(sequence[i], i, document, undefined);
            }
        }
    }
    catch (e) {
        if (e instanceof JsonPatchError) {
            return e;
        }
        else {
            throw e;
        }
    }
}
// based on https://github.com/epoberezkin/fast-deep-equal
// MIT License
// Copyright (c) 2017 Evgeny Poberezkin
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
function _areEquals(a, b) {
    if (a === b)
        return true;
    if (a && b && typeof a == 'object' && typeof b == 'object') {
        var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
        if (arrA && arrB) {
            length = a.length;
            if (length != b.length)
                return false;
            for (i = length; i-- !== 0;)
                if (!_areEquals(a[i], b[i]))
                    return false;
            return true;
        }
        if (arrA != arrB)
            return false;
        var keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length)
            return false;
        for (i = length; i-- !== 0;)
            if (!b.hasOwnProperty(keys[i]))
                return false;
        for (i = length; i-- !== 0;) {
            key = keys[i];
            if (!_areEquals(a[key], b[key]))
                return false;
        }
        return true;
    }
    return a !== a && b !== b;
}
;


/***/ }),

/***/ "../../node_modules/fast-json-patch/module/duplex.mjs":
/*!************************************************************!*\
  !*** ../../node_modules/fast-json-patch/module/duplex.mjs ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "unobserve": () => /* binding */ unobserve,
/* harmony export */   "observe": () => /* binding */ observe,
/* harmony export */   "generate": () => /* binding */ generate,
/* harmony export */   "compare": () => /* binding */ compare
/* harmony export */ });
/* harmony import */ var _helpers_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers.mjs */ "../../node_modules/fast-json-patch/module/helpers.mjs");
/* harmony import */ var _core_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./core.mjs */ "../../node_modules/fast-json-patch/module/core.mjs");
/*!
 * https://github.com/Starcounter-Jack/JSON-Patch
 * (c) 2017 Joachim Wester
 * MIT license
 */


var beforeDict = new WeakMap();
var Mirror = /** @class */ (function () {
    function Mirror(obj) {
        this.observers = new Map();
        this.obj = obj;
    }
    return Mirror;
}());
var ObserverInfo = /** @class */ (function () {
    function ObserverInfo(callback, observer) {
        this.callback = callback;
        this.observer = observer;
    }
    return ObserverInfo;
}());
function getMirror(obj) {
    return beforeDict.get(obj);
}
function getObserverFromMirror(mirror, callback) {
    return mirror.observers.get(callback);
}
function removeObserverFromMirror(mirror, observer) {
    mirror.observers.delete(observer.callback);
}
/**
 * Detach an observer from an object
 */
function unobserve(root, observer) {
    observer.unobserve();
}
/**
 * Observes changes made to an object, which can then be retrieved using generate
 */
function observe(obj, callback) {
    var patches = [];
    var observer;
    var mirror = getMirror(obj);
    if (!mirror) {
        mirror = new Mirror(obj);
        beforeDict.set(obj, mirror);
    }
    else {
        var observerInfo = getObserverFromMirror(mirror, callback);
        observer = observerInfo && observerInfo.observer;
    }
    if (observer) {
        return observer;
    }
    observer = {};
    mirror.value = (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._deepClone)(obj);
    if (callback) {
        observer.callback = callback;
        observer.next = null;
        var dirtyCheck = function () {
            generate(observer);
        };
        var fastCheck = function () {
            clearTimeout(observer.next);
            observer.next = setTimeout(dirtyCheck);
        };
        if (typeof window !== 'undefined') { //not Node
            window.addEventListener('mouseup', fastCheck);
            window.addEventListener('keyup', fastCheck);
            window.addEventListener('mousedown', fastCheck);
            window.addEventListener('keydown', fastCheck);
            window.addEventListener('change', fastCheck);
        }
    }
    observer.patches = patches;
    observer.object = obj;
    observer.unobserve = function () {
        generate(observer);
        clearTimeout(observer.next);
        removeObserverFromMirror(mirror, observer);
        if (typeof window !== 'undefined') {
            window.removeEventListener('mouseup', fastCheck);
            window.removeEventListener('keyup', fastCheck);
            window.removeEventListener('mousedown', fastCheck);
            window.removeEventListener('keydown', fastCheck);
            window.removeEventListener('change', fastCheck);
        }
    };
    mirror.observers.set(callback, new ObserverInfo(callback, observer));
    return observer;
}
/**
 * Generate an array of patches from an observer
 */
function generate(observer, invertible) {
    if (invertible === void 0) { invertible = false; }
    var mirror = beforeDict.get(observer.object);
    _generate(mirror.value, observer.object, observer.patches, "", invertible);
    if (observer.patches.length) {
        (0,_core_mjs__WEBPACK_IMPORTED_MODULE_1__.applyPatch)(mirror.value, observer.patches);
    }
    var temp = observer.patches;
    if (temp.length > 0) {
        observer.patches = [];
        if (observer.callback) {
            observer.callback(temp);
        }
    }
    return temp;
}
// Dirty check if obj is different from mirror, generate patches and update mirror
function _generate(mirror, obj, patches, path, invertible) {
    if (obj === mirror) {
        return;
    }
    if (typeof obj.toJSON === "function") {
        obj = obj.toJSON();
    }
    var newKeys = (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._objectKeys)(obj);
    var oldKeys = (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._objectKeys)(mirror);
    var changed = false;
    var deleted = false;
    //if ever "move" operation is implemented here, make sure this test runs OK: "should not generate the same patch twice (move)"
    for (var t = oldKeys.length - 1; t >= 0; t--) {
        var key = oldKeys[t];
        var oldVal = mirror[key];
        if ((0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.hasOwnProperty)(obj, key) && !(obj[key] === undefined && oldVal !== undefined && Array.isArray(obj) === false)) {
            var newVal = obj[key];
            if (typeof oldVal == "object" && oldVal != null && typeof newVal == "object" && newVal != null) {
                _generate(oldVal, newVal, patches, path + "/" + (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.escapePathComponent)(key), invertible);
            }
            else {
                if (oldVal !== newVal) {
                    changed = true;
                    if (invertible) {
                        patches.push({ op: "test", path: path + "/" + (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.escapePathComponent)(key), value: (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._deepClone)(oldVal) });
                    }
                    patches.push({ op: "replace", path: path + "/" + (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.escapePathComponent)(key), value: (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._deepClone)(newVal) });
                }
            }
        }
        else if (Array.isArray(mirror) === Array.isArray(obj)) {
            if (invertible) {
                patches.push({ op: "test", path: path + "/" + (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.escapePathComponent)(key), value: (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._deepClone)(oldVal) });
            }
            patches.push({ op: "remove", path: path + "/" + (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.escapePathComponent)(key) });
            deleted = true; // property has been deleted
        }
        else {
            if (invertible) {
                patches.push({ op: "test", path: path, value: mirror });
            }
            patches.push({ op: "replace", path: path, value: obj });
            changed = true;
        }
    }
    if (!deleted && newKeys.length == oldKeys.length) {
        return;
    }
    for (var t = 0; t < newKeys.length; t++) {
        var key = newKeys[t];
        if (!(0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.hasOwnProperty)(mirror, key) && obj[key] !== undefined) {
            patches.push({ op: "add", path: path + "/" + (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.escapePathComponent)(key), value: (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__._deepClone)(obj[key]) });
        }
    }
}
/**
 * Create an array of patches from the differences in two objects
 */
function compare(tree1, tree2, invertible) {
    if (invertible === void 0) { invertible = false; }
    var patches = [];
    _generate(tree1, tree2, patches, '', invertible);
    return patches;
}


/***/ }),

/***/ "../../node_modules/fast-json-patch/module/helpers.mjs":
/*!*************************************************************!*\
  !*** ../../node_modules/fast-json-patch/module/helpers.mjs ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hasOwnProperty": () => /* binding */ hasOwnProperty,
/* harmony export */   "_objectKeys": () => /* binding */ _objectKeys,
/* harmony export */   "_deepClone": () => /* binding */ _deepClone,
/* harmony export */   "isInteger": () => /* binding */ isInteger,
/* harmony export */   "escapePathComponent": () => /* binding */ escapePathComponent,
/* harmony export */   "unescapePathComponent": () => /* binding */ unescapePathComponent,
/* harmony export */   "_getPathRecursive": () => /* binding */ _getPathRecursive,
/* harmony export */   "getPath": () => /* binding */ getPath,
/* harmony export */   "hasUndefined": () => /* binding */ hasUndefined,
/* harmony export */   "PatchError": () => /* binding */ PatchError
/* harmony export */ });
/*!
 * https://github.com/Starcounter-Jack/JSON-Patch
 * (c) 2017 Joachim Wester
 * MIT license
 */
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj, key) {
    return _hasOwnProperty.call(obj, key);
}
function _objectKeys(obj) {
    if (Array.isArray(obj)) {
        var keys = new Array(obj.length);
        for (var k = 0; k < keys.length; k++) {
            keys[k] = "" + k;
        }
        return keys;
    }
    if (Object.keys) {
        return Object.keys(obj);
    }
    var keys = [];
    for (var i in obj) {
        if (hasOwnProperty(obj, i)) {
            keys.push(i);
        }
    }
    return keys;
}
;
/**
* Deeply clone the object.
* https://jsperf.com/deep-copy-vs-json-stringify-json-parse/25 (recursiveDeepCopy)
* @param  {any} obj value to clone
* @return {any} cloned obj
*/
function _deepClone(obj) {
    switch (typeof obj) {
        case "object":
            return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
        case "undefined":
            return null; //this is how JSON.stringify behaves for array items
        default:
            return obj; //no need to clone primitives
    }
}
//3x faster than cached /^\d+$/.test(str)
function isInteger(str) {
    var i = 0;
    var len = str.length;
    var charCode;
    while (i < len) {
        charCode = str.charCodeAt(i);
        if (charCode >= 48 && charCode <= 57) {
            i++;
            continue;
        }
        return false;
    }
    return true;
}
/**
* Escapes a json pointer path
* @param path The raw pointer
* @return the Escaped path
*/
function escapePathComponent(path) {
    if (path.indexOf('/') === -1 && path.indexOf('~') === -1)
        return path;
    return path.replace(/~/g, '~0').replace(/\//g, '~1');
}
/**
 * Unescapes a json pointer path
 * @param path The escaped pointer
 * @return The unescaped path
 */
function unescapePathComponent(path) {
    return path.replace(/~1/g, '/').replace(/~0/g, '~');
}
function _getPathRecursive(root, obj) {
    var found;
    for (var key in root) {
        if (hasOwnProperty(root, key)) {
            if (root[key] === obj) {
                return escapePathComponent(key) + '/';
            }
            else if (typeof root[key] === 'object') {
                found = _getPathRecursive(root[key], obj);
                if (found != '') {
                    return escapePathComponent(key) + '/' + found;
                }
            }
        }
    }
    return '';
}
function getPath(root, obj) {
    if (root === obj) {
        return '/';
    }
    var path = _getPathRecursive(root, obj);
    if (path === '') {
        throw new Error("Object not found in root");
    }
    return '/' + path;
}
/**
* Recursively checks whether an object has any undefined values inside.
*/
function hasUndefined(obj) {
    if (obj === undefined) {
        return true;
    }
    if (obj) {
        if (Array.isArray(obj)) {
            for (var i = 0, len = obj.length; i < len; i++) {
                if (hasUndefined(obj[i])) {
                    return true;
                }
            }
        }
        else if (typeof obj === "object") {
            var objKeys = _objectKeys(obj);
            var objKeysLength = objKeys.length;
            for (var i = 0; i < objKeysLength; i++) {
                if (hasUndefined(obj[objKeys[i]])) {
                    return true;
                }
            }
        }
    }
    return false;
}
function patchErrorMessageFormatter(message, args) {
    var messageParts = [message];
    for (var key in args) {
        var value = typeof args[key] === 'object' ? JSON.stringify(args[key], null, 2) : args[key]; // pretty print
        if (typeof value !== 'undefined') {
            messageParts.push(key + ": " + value);
        }
    }
    return messageParts.join('\n');
}
var PatchError = /** @class */ (function (_super) {
    __extends(PatchError, _super);
    function PatchError(message, name, index, operation, tree) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, patchErrorMessageFormatter(message, { name: name, index: index, operation: operation, tree: tree })) || this;
        _this.name = name;
        _this.index = index;
        _this.operation = operation;
        _this.tree = tree;
        Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain, see https://stackoverflow.com/a/48342359
        _this.message = patchErrorMessageFormatter(message, { name: name, index: index, operation: operation, tree: tree });
        return _this;
    }
    return PatchError;
}(Error));



/***/ }),

/***/ "../../node_modules/html-entities/lib/html4-entities.js":
/*!**************************************************************!*\
  !*** ../../node_modules/html-entities/lib/html4-entities.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var surrogate_pairs_1 = __webpack_require__(/*! ./surrogate-pairs */ "../../node_modules/html-entities/lib/surrogate-pairs.js");
var HTML_ALPHA = ['apos', 'nbsp', 'iexcl', 'cent', 'pound', 'curren', 'yen', 'brvbar', 'sect', 'uml', 'copy', 'ordf', 'laquo', 'not', 'shy', 'reg', 'macr', 'deg', 'plusmn', 'sup2', 'sup3', 'acute', 'micro', 'para', 'middot', 'cedil', 'sup1', 'ordm', 'raquo', 'frac14', 'frac12', 'frac34', 'iquest', 'Agrave', 'Aacute', 'Acirc', 'Atilde', 'Auml', 'Aring', 'AElig', 'Ccedil', 'Egrave', 'Eacute', 'Ecirc', 'Euml', 'Igrave', 'Iacute', 'Icirc', 'Iuml', 'ETH', 'Ntilde', 'Ograve', 'Oacute', 'Ocirc', 'Otilde', 'Ouml', 'times', 'Oslash', 'Ugrave', 'Uacute', 'Ucirc', 'Uuml', 'Yacute', 'THORN', 'szlig', 'agrave', 'aacute', 'acirc', 'atilde', 'auml', 'aring', 'aelig', 'ccedil', 'egrave', 'eacute', 'ecirc', 'euml', 'igrave', 'iacute', 'icirc', 'iuml', 'eth', 'ntilde', 'ograve', 'oacute', 'ocirc', 'otilde', 'ouml', 'divide', 'oslash', 'ugrave', 'uacute', 'ucirc', 'uuml', 'yacute', 'thorn', 'yuml', 'quot', 'amp', 'lt', 'gt', 'OElig', 'oelig', 'Scaron', 'scaron', 'Yuml', 'circ', 'tilde', 'ensp', 'emsp', 'thinsp', 'zwnj', 'zwj', 'lrm', 'rlm', 'ndash', 'mdash', 'lsquo', 'rsquo', 'sbquo', 'ldquo', 'rdquo', 'bdquo', 'dagger', 'Dagger', 'permil', 'lsaquo', 'rsaquo', 'euro', 'fnof', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigmaf', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega', 'thetasym', 'upsih', 'piv', 'bull', 'hellip', 'prime', 'Prime', 'oline', 'frasl', 'weierp', 'image', 'real', 'trade', 'alefsym', 'larr', 'uarr', 'rarr', 'darr', 'harr', 'crarr', 'lArr', 'uArr', 'rArr', 'dArr', 'hArr', 'forall', 'part', 'exist', 'empty', 'nabla', 'isin', 'notin', 'ni', 'prod', 'sum', 'minus', 'lowast', 'radic', 'prop', 'infin', 'ang', 'and', 'or', 'cap', 'cup', 'int', 'there4', 'sim', 'cong', 'asymp', 'ne', 'equiv', 'le', 'ge', 'sub', 'sup', 'nsub', 'sube', 'supe', 'oplus', 'otimes', 'perp', 'sdot', 'lceil', 'rceil', 'lfloor', 'rfloor', 'lang', 'rang', 'loz', 'spades', 'clubs', 'hearts', 'diams'];
var HTML_CODES = [39, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 34, 38, 60, 62, 338, 339, 352, 353, 376, 710, 732, 8194, 8195, 8201, 8204, 8205, 8206, 8207, 8211, 8212, 8216, 8217, 8218, 8220, 8221, 8222, 8224, 8225, 8240, 8249, 8250, 8364, 402, 913, 914, 915, 916, 917, 918, 919, 920, 921, 922, 923, 924, 925, 926, 927, 928, 929, 931, 932, 933, 934, 935, 936, 937, 945, 946, 947, 948, 949, 950, 951, 952, 953, 954, 955, 956, 957, 958, 959, 960, 961, 962, 963, 964, 965, 966, 967, 968, 969, 977, 978, 982, 8226, 8230, 8242, 8243, 8254, 8260, 8472, 8465, 8476, 8482, 8501, 8592, 8593, 8594, 8595, 8596, 8629, 8656, 8657, 8658, 8659, 8660, 8704, 8706, 8707, 8709, 8711, 8712, 8713, 8715, 8719, 8721, 8722, 8727, 8730, 8733, 8734, 8736, 8743, 8744, 8745, 8746, 8747, 8756, 8764, 8773, 8776, 8800, 8801, 8804, 8805, 8834, 8835, 8836, 8838, 8839, 8853, 8855, 8869, 8901, 8968, 8969, 8970, 8971, 9001, 9002, 9674, 9824, 9827, 9829, 9830];
var alphaIndex = {};
var numIndex = {};
(function () {
    var i = 0;
    var length = HTML_ALPHA.length;
    while (i < length) {
        var a = HTML_ALPHA[i];
        var c = HTML_CODES[i];
        alphaIndex[a] = String.fromCharCode(c);
        numIndex[c] = a;
        i++;
    }
})();
var Html4Entities = /** @class */ (function () {
    function Html4Entities() {
    }
    Html4Entities.prototype.decode = function (str) {
        if (!str || !str.length) {
            return '';
        }
        return str.replace(/&(#?[\w\d]+);?/g, function (s, entity) {
            var chr;
            if (entity.charAt(0) === "#") {
                var code = entity.charAt(1).toLowerCase() === 'x' ?
                    parseInt(entity.substr(2), 16) :
                    parseInt(entity.substr(1));
                if (!isNaN(code) || code >= -32768) {
                    if (code <= 65535) {
                        chr = String.fromCharCode(code);
                    }
                    else {
                        chr = surrogate_pairs_1.fromCodePoint(code);
                    }
                }
            }
            else {
                chr = alphaIndex[entity];
            }
            return chr || s;
        });
    };
    Html4Entities.decode = function (str) {
        return new Html4Entities().decode(str);
    };
    Html4Entities.prototype.encode = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var alpha = numIndex[str.charCodeAt(i)];
            result += alpha ? "&" + alpha + ";" : str.charAt(i);
            i++;
        }
        return result;
    };
    Html4Entities.encode = function (str) {
        return new Html4Entities().encode(str);
    };
    Html4Entities.prototype.encodeNonUTF = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var cc = str.charCodeAt(i);
            var alpha = numIndex[cc];
            if (alpha) {
                result += "&" + alpha + ";";
            }
            else if (cc < 32 || cc > 126) {
                if (cc >= surrogate_pairs_1.highSurrogateFrom && cc <= surrogate_pairs_1.highSurrogateTo) {
                    result += '&#' + surrogate_pairs_1.getCodePoint(str, i) + ';';
                    i++;
                }
                else {
                    result += '&#' + cc + ';';
                }
            }
            else {
                result += str.charAt(i);
            }
            i++;
        }
        return result;
    };
    Html4Entities.encodeNonUTF = function (str) {
        return new Html4Entities().encodeNonUTF(str);
    };
    Html4Entities.prototype.encodeNonASCII = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var c = str.charCodeAt(i);
            if (c <= 255) {
                result += str[i++];
                continue;
            }
            if (c >= surrogate_pairs_1.highSurrogateFrom && c <= surrogate_pairs_1.highSurrogateTo) {
                result += '&#' + surrogate_pairs_1.getCodePoint(str, i) + ';';
                i++;
            }
            else {
                result += '&#' + c + ';';
            }
            i++;
        }
        return result;
    };
    Html4Entities.encodeNonASCII = function (str) {
        return new Html4Entities().encodeNonASCII(str);
    };
    return Html4Entities;
}());
exports.Html4Entities = Html4Entities;


/***/ }),

/***/ "../../node_modules/html-entities/lib/html5-entities.js":
/*!**************************************************************!*\
  !*** ../../node_modules/html-entities/lib/html5-entities.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var surrogate_pairs_1 = __webpack_require__(/*! ./surrogate-pairs */ "../../node_modules/html-entities/lib/surrogate-pairs.js");
var ENTITIES = [['Aacute', [193]], ['aacute', [225]], ['Abreve', [258]], ['abreve', [259]], ['ac', [8766]], ['acd', [8767]], ['acE', [8766, 819]], ['Acirc', [194]], ['acirc', [226]], ['acute', [180]], ['Acy', [1040]], ['acy', [1072]], ['AElig', [198]], ['aelig', [230]], ['af', [8289]], ['Afr', [120068]], ['afr', [120094]], ['Agrave', [192]], ['agrave', [224]], ['alefsym', [8501]], ['aleph', [8501]], ['Alpha', [913]], ['alpha', [945]], ['Amacr', [256]], ['amacr', [257]], ['amalg', [10815]], ['amp', [38]], ['AMP', [38]], ['andand', [10837]], ['And', [10835]], ['and', [8743]], ['andd', [10844]], ['andslope', [10840]], ['andv', [10842]], ['ang', [8736]], ['ange', [10660]], ['angle', [8736]], ['angmsdaa', [10664]], ['angmsdab', [10665]], ['angmsdac', [10666]], ['angmsdad', [10667]], ['angmsdae', [10668]], ['angmsdaf', [10669]], ['angmsdag', [10670]], ['angmsdah', [10671]], ['angmsd', [8737]], ['angrt', [8735]], ['angrtvb', [8894]], ['angrtvbd', [10653]], ['angsph', [8738]], ['angst', [197]], ['angzarr', [9084]], ['Aogon', [260]], ['aogon', [261]], ['Aopf', [120120]], ['aopf', [120146]], ['apacir', [10863]], ['ap', [8776]], ['apE', [10864]], ['ape', [8778]], ['apid', [8779]], ['apos', [39]], ['ApplyFunction', [8289]], ['approx', [8776]], ['approxeq', [8778]], ['Aring', [197]], ['aring', [229]], ['Ascr', [119964]], ['ascr', [119990]], ['Assign', [8788]], ['ast', [42]], ['asymp', [8776]], ['asympeq', [8781]], ['Atilde', [195]], ['atilde', [227]], ['Auml', [196]], ['auml', [228]], ['awconint', [8755]], ['awint', [10769]], ['backcong', [8780]], ['backepsilon', [1014]], ['backprime', [8245]], ['backsim', [8765]], ['backsimeq', [8909]], ['Backslash', [8726]], ['Barv', [10983]], ['barvee', [8893]], ['barwed', [8965]], ['Barwed', [8966]], ['barwedge', [8965]], ['bbrk', [9141]], ['bbrktbrk', [9142]], ['bcong', [8780]], ['Bcy', [1041]], ['bcy', [1073]], ['bdquo', [8222]], ['becaus', [8757]], ['because', [8757]], ['Because', [8757]], ['bemptyv', [10672]], ['bepsi', [1014]], ['bernou', [8492]], ['Bernoullis', [8492]], ['Beta', [914]], ['beta', [946]], ['beth', [8502]], ['between', [8812]], ['Bfr', [120069]], ['bfr', [120095]], ['bigcap', [8898]], ['bigcirc', [9711]], ['bigcup', [8899]], ['bigodot', [10752]], ['bigoplus', [10753]], ['bigotimes', [10754]], ['bigsqcup', [10758]], ['bigstar', [9733]], ['bigtriangledown', [9661]], ['bigtriangleup', [9651]], ['biguplus', [10756]], ['bigvee', [8897]], ['bigwedge', [8896]], ['bkarow', [10509]], ['blacklozenge', [10731]], ['blacksquare', [9642]], ['blacktriangle', [9652]], ['blacktriangledown', [9662]], ['blacktriangleleft', [9666]], ['blacktriangleright', [9656]], ['blank', [9251]], ['blk12', [9618]], ['blk14', [9617]], ['blk34', [9619]], ['block', [9608]], ['bne', [61, 8421]], ['bnequiv', [8801, 8421]], ['bNot', [10989]], ['bnot', [8976]], ['Bopf', [120121]], ['bopf', [120147]], ['bot', [8869]], ['bottom', [8869]], ['bowtie', [8904]], ['boxbox', [10697]], ['boxdl', [9488]], ['boxdL', [9557]], ['boxDl', [9558]], ['boxDL', [9559]], ['boxdr', [9484]], ['boxdR', [9554]], ['boxDr', [9555]], ['boxDR', [9556]], ['boxh', [9472]], ['boxH', [9552]], ['boxhd', [9516]], ['boxHd', [9572]], ['boxhD', [9573]], ['boxHD', [9574]], ['boxhu', [9524]], ['boxHu', [9575]], ['boxhU', [9576]], ['boxHU', [9577]], ['boxminus', [8863]], ['boxplus', [8862]], ['boxtimes', [8864]], ['boxul', [9496]], ['boxuL', [9563]], ['boxUl', [9564]], ['boxUL', [9565]], ['boxur', [9492]], ['boxuR', [9560]], ['boxUr', [9561]], ['boxUR', [9562]], ['boxv', [9474]], ['boxV', [9553]], ['boxvh', [9532]], ['boxvH', [9578]], ['boxVh', [9579]], ['boxVH', [9580]], ['boxvl', [9508]], ['boxvL', [9569]], ['boxVl', [9570]], ['boxVL', [9571]], ['boxvr', [9500]], ['boxvR', [9566]], ['boxVr', [9567]], ['boxVR', [9568]], ['bprime', [8245]], ['breve', [728]], ['Breve', [728]], ['brvbar', [166]], ['bscr', [119991]], ['Bscr', [8492]], ['bsemi', [8271]], ['bsim', [8765]], ['bsime', [8909]], ['bsolb', [10693]], ['bsol', [92]], ['bsolhsub', [10184]], ['bull', [8226]], ['bullet', [8226]], ['bump', [8782]], ['bumpE', [10926]], ['bumpe', [8783]], ['Bumpeq', [8782]], ['bumpeq', [8783]], ['Cacute', [262]], ['cacute', [263]], ['capand', [10820]], ['capbrcup', [10825]], ['capcap', [10827]], ['cap', [8745]], ['Cap', [8914]], ['capcup', [10823]], ['capdot', [10816]], ['CapitalDifferentialD', [8517]], ['caps', [8745, 65024]], ['caret', [8257]], ['caron', [711]], ['Cayleys', [8493]], ['ccaps', [10829]], ['Ccaron', [268]], ['ccaron', [269]], ['Ccedil', [199]], ['ccedil', [231]], ['Ccirc', [264]], ['ccirc', [265]], ['Cconint', [8752]], ['ccups', [10828]], ['ccupssm', [10832]], ['Cdot', [266]], ['cdot', [267]], ['cedil', [184]], ['Cedilla', [184]], ['cemptyv', [10674]], ['cent', [162]], ['centerdot', [183]], ['CenterDot', [183]], ['cfr', [120096]], ['Cfr', [8493]], ['CHcy', [1063]], ['chcy', [1095]], ['check', [10003]], ['checkmark', [10003]], ['Chi', [935]], ['chi', [967]], ['circ', [710]], ['circeq', [8791]], ['circlearrowleft', [8634]], ['circlearrowright', [8635]], ['circledast', [8859]], ['circledcirc', [8858]], ['circleddash', [8861]], ['CircleDot', [8857]], ['circledR', [174]], ['circledS', [9416]], ['CircleMinus', [8854]], ['CirclePlus', [8853]], ['CircleTimes', [8855]], ['cir', [9675]], ['cirE', [10691]], ['cire', [8791]], ['cirfnint', [10768]], ['cirmid', [10991]], ['cirscir', [10690]], ['ClockwiseContourIntegral', [8754]], ['clubs', [9827]], ['clubsuit', [9827]], ['colon', [58]], ['Colon', [8759]], ['Colone', [10868]], ['colone', [8788]], ['coloneq', [8788]], ['comma', [44]], ['commat', [64]], ['comp', [8705]], ['compfn', [8728]], ['complement', [8705]], ['complexes', [8450]], ['cong', [8773]], ['congdot', [10861]], ['Congruent', [8801]], ['conint', [8750]], ['Conint', [8751]], ['ContourIntegral', [8750]], ['copf', [120148]], ['Copf', [8450]], ['coprod', [8720]], ['Coproduct', [8720]], ['copy', [169]], ['COPY', [169]], ['copysr', [8471]], ['CounterClockwiseContourIntegral', [8755]], ['crarr', [8629]], ['cross', [10007]], ['Cross', [10799]], ['Cscr', [119966]], ['cscr', [119992]], ['csub', [10959]], ['csube', [10961]], ['csup', [10960]], ['csupe', [10962]], ['ctdot', [8943]], ['cudarrl', [10552]], ['cudarrr', [10549]], ['cuepr', [8926]], ['cuesc', [8927]], ['cularr', [8630]], ['cularrp', [10557]], ['cupbrcap', [10824]], ['cupcap', [10822]], ['CupCap', [8781]], ['cup', [8746]], ['Cup', [8915]], ['cupcup', [10826]], ['cupdot', [8845]], ['cupor', [10821]], ['cups', [8746, 65024]], ['curarr', [8631]], ['curarrm', [10556]], ['curlyeqprec', [8926]], ['curlyeqsucc', [8927]], ['curlyvee', [8910]], ['curlywedge', [8911]], ['curren', [164]], ['curvearrowleft', [8630]], ['curvearrowright', [8631]], ['cuvee', [8910]], ['cuwed', [8911]], ['cwconint', [8754]], ['cwint', [8753]], ['cylcty', [9005]], ['dagger', [8224]], ['Dagger', [8225]], ['daleth', [8504]], ['darr', [8595]], ['Darr', [8609]], ['dArr', [8659]], ['dash', [8208]], ['Dashv', [10980]], ['dashv', [8867]], ['dbkarow', [10511]], ['dblac', [733]], ['Dcaron', [270]], ['dcaron', [271]], ['Dcy', [1044]], ['dcy', [1076]], ['ddagger', [8225]], ['ddarr', [8650]], ['DD', [8517]], ['dd', [8518]], ['DDotrahd', [10513]], ['ddotseq', [10871]], ['deg', [176]], ['Del', [8711]], ['Delta', [916]], ['delta', [948]], ['demptyv', [10673]], ['dfisht', [10623]], ['Dfr', [120071]], ['dfr', [120097]], ['dHar', [10597]], ['dharl', [8643]], ['dharr', [8642]], ['DiacriticalAcute', [180]], ['DiacriticalDot', [729]], ['DiacriticalDoubleAcute', [733]], ['DiacriticalGrave', [96]], ['DiacriticalTilde', [732]], ['diam', [8900]], ['diamond', [8900]], ['Diamond', [8900]], ['diamondsuit', [9830]], ['diams', [9830]], ['die', [168]], ['DifferentialD', [8518]], ['digamma', [989]], ['disin', [8946]], ['div', [247]], ['divide', [247]], ['divideontimes', [8903]], ['divonx', [8903]], ['DJcy', [1026]], ['djcy', [1106]], ['dlcorn', [8990]], ['dlcrop', [8973]], ['dollar', [36]], ['Dopf', [120123]], ['dopf', [120149]], ['Dot', [168]], ['dot', [729]], ['DotDot', [8412]], ['doteq', [8784]], ['doteqdot', [8785]], ['DotEqual', [8784]], ['dotminus', [8760]], ['dotplus', [8724]], ['dotsquare', [8865]], ['doublebarwedge', [8966]], ['DoubleContourIntegral', [8751]], ['DoubleDot', [168]], ['DoubleDownArrow', [8659]], ['DoubleLeftArrow', [8656]], ['DoubleLeftRightArrow', [8660]], ['DoubleLeftTee', [10980]], ['DoubleLongLeftArrow', [10232]], ['DoubleLongLeftRightArrow', [10234]], ['DoubleLongRightArrow', [10233]], ['DoubleRightArrow', [8658]], ['DoubleRightTee', [8872]], ['DoubleUpArrow', [8657]], ['DoubleUpDownArrow', [8661]], ['DoubleVerticalBar', [8741]], ['DownArrowBar', [10515]], ['downarrow', [8595]], ['DownArrow', [8595]], ['Downarrow', [8659]], ['DownArrowUpArrow', [8693]], ['DownBreve', [785]], ['downdownarrows', [8650]], ['downharpoonleft', [8643]], ['downharpoonright', [8642]], ['DownLeftRightVector', [10576]], ['DownLeftTeeVector', [10590]], ['DownLeftVectorBar', [10582]], ['DownLeftVector', [8637]], ['DownRightTeeVector', [10591]], ['DownRightVectorBar', [10583]], ['DownRightVector', [8641]], ['DownTeeArrow', [8615]], ['DownTee', [8868]], ['drbkarow', [10512]], ['drcorn', [8991]], ['drcrop', [8972]], ['Dscr', [119967]], ['dscr', [119993]], ['DScy', [1029]], ['dscy', [1109]], ['dsol', [10742]], ['Dstrok', [272]], ['dstrok', [273]], ['dtdot', [8945]], ['dtri', [9663]], ['dtrif', [9662]], ['duarr', [8693]], ['duhar', [10607]], ['dwangle', [10662]], ['DZcy', [1039]], ['dzcy', [1119]], ['dzigrarr', [10239]], ['Eacute', [201]], ['eacute', [233]], ['easter', [10862]], ['Ecaron', [282]], ['ecaron', [283]], ['Ecirc', [202]], ['ecirc', [234]], ['ecir', [8790]], ['ecolon', [8789]], ['Ecy', [1069]], ['ecy', [1101]], ['eDDot', [10871]], ['Edot', [278]], ['edot', [279]], ['eDot', [8785]], ['ee', [8519]], ['efDot', [8786]], ['Efr', [120072]], ['efr', [120098]], ['eg', [10906]], ['Egrave', [200]], ['egrave', [232]], ['egs', [10902]], ['egsdot', [10904]], ['el', [10905]], ['Element', [8712]], ['elinters', [9191]], ['ell', [8467]], ['els', [10901]], ['elsdot', [10903]], ['Emacr', [274]], ['emacr', [275]], ['empty', [8709]], ['emptyset', [8709]], ['EmptySmallSquare', [9723]], ['emptyv', [8709]], ['EmptyVerySmallSquare', [9643]], ['emsp13', [8196]], ['emsp14', [8197]], ['emsp', [8195]], ['ENG', [330]], ['eng', [331]], ['ensp', [8194]], ['Eogon', [280]], ['eogon', [281]], ['Eopf', [120124]], ['eopf', [120150]], ['epar', [8917]], ['eparsl', [10723]], ['eplus', [10865]], ['epsi', [949]], ['Epsilon', [917]], ['epsilon', [949]], ['epsiv', [1013]], ['eqcirc', [8790]], ['eqcolon', [8789]], ['eqsim', [8770]], ['eqslantgtr', [10902]], ['eqslantless', [10901]], ['Equal', [10869]], ['equals', [61]], ['EqualTilde', [8770]], ['equest', [8799]], ['Equilibrium', [8652]], ['equiv', [8801]], ['equivDD', [10872]], ['eqvparsl', [10725]], ['erarr', [10609]], ['erDot', [8787]], ['escr', [8495]], ['Escr', [8496]], ['esdot', [8784]], ['Esim', [10867]], ['esim', [8770]], ['Eta', [919]], ['eta', [951]], ['ETH', [208]], ['eth', [240]], ['Euml', [203]], ['euml', [235]], ['euro', [8364]], ['excl', [33]], ['exist', [8707]], ['Exists', [8707]], ['expectation', [8496]], ['exponentiale', [8519]], ['ExponentialE', [8519]], ['fallingdotseq', [8786]], ['Fcy', [1060]], ['fcy', [1092]], ['female', [9792]], ['ffilig', [64259]], ['fflig', [64256]], ['ffllig', [64260]], ['Ffr', [120073]], ['ffr', [120099]], ['filig', [64257]], ['FilledSmallSquare', [9724]], ['FilledVerySmallSquare', [9642]], ['fjlig', [102, 106]], ['flat', [9837]], ['fllig', [64258]], ['fltns', [9649]], ['fnof', [402]], ['Fopf', [120125]], ['fopf', [120151]], ['forall', [8704]], ['ForAll', [8704]], ['fork', [8916]], ['forkv', [10969]], ['Fouriertrf', [8497]], ['fpartint', [10765]], ['frac12', [189]], ['frac13', [8531]], ['frac14', [188]], ['frac15', [8533]], ['frac16', [8537]], ['frac18', [8539]], ['frac23', [8532]], ['frac25', [8534]], ['frac34', [190]], ['frac35', [8535]], ['frac38', [8540]], ['frac45', [8536]], ['frac56', [8538]], ['frac58', [8541]], ['frac78', [8542]], ['frasl', [8260]], ['frown', [8994]], ['fscr', [119995]], ['Fscr', [8497]], ['gacute', [501]], ['Gamma', [915]], ['gamma', [947]], ['Gammad', [988]], ['gammad', [989]], ['gap', [10886]], ['Gbreve', [286]], ['gbreve', [287]], ['Gcedil', [290]], ['Gcirc', [284]], ['gcirc', [285]], ['Gcy', [1043]], ['gcy', [1075]], ['Gdot', [288]], ['gdot', [289]], ['ge', [8805]], ['gE', [8807]], ['gEl', [10892]], ['gel', [8923]], ['geq', [8805]], ['geqq', [8807]], ['geqslant', [10878]], ['gescc', [10921]], ['ges', [10878]], ['gesdot', [10880]], ['gesdoto', [10882]], ['gesdotol', [10884]], ['gesl', [8923, 65024]], ['gesles', [10900]], ['Gfr', [120074]], ['gfr', [120100]], ['gg', [8811]], ['Gg', [8921]], ['ggg', [8921]], ['gimel', [8503]], ['GJcy', [1027]], ['gjcy', [1107]], ['gla', [10917]], ['gl', [8823]], ['glE', [10898]], ['glj', [10916]], ['gnap', [10890]], ['gnapprox', [10890]], ['gne', [10888]], ['gnE', [8809]], ['gneq', [10888]], ['gneqq', [8809]], ['gnsim', [8935]], ['Gopf', [120126]], ['gopf', [120152]], ['grave', [96]], ['GreaterEqual', [8805]], ['GreaterEqualLess', [8923]], ['GreaterFullEqual', [8807]], ['GreaterGreater', [10914]], ['GreaterLess', [8823]], ['GreaterSlantEqual', [10878]], ['GreaterTilde', [8819]], ['Gscr', [119970]], ['gscr', [8458]], ['gsim', [8819]], ['gsime', [10894]], ['gsiml', [10896]], ['gtcc', [10919]], ['gtcir', [10874]], ['gt', [62]], ['GT', [62]], ['Gt', [8811]], ['gtdot', [8919]], ['gtlPar', [10645]], ['gtquest', [10876]], ['gtrapprox', [10886]], ['gtrarr', [10616]], ['gtrdot', [8919]], ['gtreqless', [8923]], ['gtreqqless', [10892]], ['gtrless', [8823]], ['gtrsim', [8819]], ['gvertneqq', [8809, 65024]], ['gvnE', [8809, 65024]], ['Hacek', [711]], ['hairsp', [8202]], ['half', [189]], ['hamilt', [8459]], ['HARDcy', [1066]], ['hardcy', [1098]], ['harrcir', [10568]], ['harr', [8596]], ['hArr', [8660]], ['harrw', [8621]], ['Hat', [94]], ['hbar', [8463]], ['Hcirc', [292]], ['hcirc', [293]], ['hearts', [9829]], ['heartsuit', [9829]], ['hellip', [8230]], ['hercon', [8889]], ['hfr', [120101]], ['Hfr', [8460]], ['HilbertSpace', [8459]], ['hksearow', [10533]], ['hkswarow', [10534]], ['hoarr', [8703]], ['homtht', [8763]], ['hookleftarrow', [8617]], ['hookrightarrow', [8618]], ['hopf', [120153]], ['Hopf', [8461]], ['horbar', [8213]], ['HorizontalLine', [9472]], ['hscr', [119997]], ['Hscr', [8459]], ['hslash', [8463]], ['Hstrok', [294]], ['hstrok', [295]], ['HumpDownHump', [8782]], ['HumpEqual', [8783]], ['hybull', [8259]], ['hyphen', [8208]], ['Iacute', [205]], ['iacute', [237]], ['ic', [8291]], ['Icirc', [206]], ['icirc', [238]], ['Icy', [1048]], ['icy', [1080]], ['Idot', [304]], ['IEcy', [1045]], ['iecy', [1077]], ['iexcl', [161]], ['iff', [8660]], ['ifr', [120102]], ['Ifr', [8465]], ['Igrave', [204]], ['igrave', [236]], ['ii', [8520]], ['iiiint', [10764]], ['iiint', [8749]], ['iinfin', [10716]], ['iiota', [8489]], ['IJlig', [306]], ['ijlig', [307]], ['Imacr', [298]], ['imacr', [299]], ['image', [8465]], ['ImaginaryI', [8520]], ['imagline', [8464]], ['imagpart', [8465]], ['imath', [305]], ['Im', [8465]], ['imof', [8887]], ['imped', [437]], ['Implies', [8658]], ['incare', [8453]], ['in', [8712]], ['infin', [8734]], ['infintie', [10717]], ['inodot', [305]], ['intcal', [8890]], ['int', [8747]], ['Int', [8748]], ['integers', [8484]], ['Integral', [8747]], ['intercal', [8890]], ['Intersection', [8898]], ['intlarhk', [10775]], ['intprod', [10812]], ['InvisibleComma', [8291]], ['InvisibleTimes', [8290]], ['IOcy', [1025]], ['iocy', [1105]], ['Iogon', [302]], ['iogon', [303]], ['Iopf', [120128]], ['iopf', [120154]], ['Iota', [921]], ['iota', [953]], ['iprod', [10812]], ['iquest', [191]], ['iscr', [119998]], ['Iscr', [8464]], ['isin', [8712]], ['isindot', [8949]], ['isinE', [8953]], ['isins', [8948]], ['isinsv', [8947]], ['isinv', [8712]], ['it', [8290]], ['Itilde', [296]], ['itilde', [297]], ['Iukcy', [1030]], ['iukcy', [1110]], ['Iuml', [207]], ['iuml', [239]], ['Jcirc', [308]], ['jcirc', [309]], ['Jcy', [1049]], ['jcy', [1081]], ['Jfr', [120077]], ['jfr', [120103]], ['jmath', [567]], ['Jopf', [120129]], ['jopf', [120155]], ['Jscr', [119973]], ['jscr', [119999]], ['Jsercy', [1032]], ['jsercy', [1112]], ['Jukcy', [1028]], ['jukcy', [1108]], ['Kappa', [922]], ['kappa', [954]], ['kappav', [1008]], ['Kcedil', [310]], ['kcedil', [311]], ['Kcy', [1050]], ['kcy', [1082]], ['Kfr', [120078]], ['kfr', [120104]], ['kgreen', [312]], ['KHcy', [1061]], ['khcy', [1093]], ['KJcy', [1036]], ['kjcy', [1116]], ['Kopf', [120130]], ['kopf', [120156]], ['Kscr', [119974]], ['kscr', [120000]], ['lAarr', [8666]], ['Lacute', [313]], ['lacute', [314]], ['laemptyv', [10676]], ['lagran', [8466]], ['Lambda', [923]], ['lambda', [955]], ['lang', [10216]], ['Lang', [10218]], ['langd', [10641]], ['langle', [10216]], ['lap', [10885]], ['Laplacetrf', [8466]], ['laquo', [171]], ['larrb', [8676]], ['larrbfs', [10527]], ['larr', [8592]], ['Larr', [8606]], ['lArr', [8656]], ['larrfs', [10525]], ['larrhk', [8617]], ['larrlp', [8619]], ['larrpl', [10553]], ['larrsim', [10611]], ['larrtl', [8610]], ['latail', [10521]], ['lAtail', [10523]], ['lat', [10923]], ['late', [10925]], ['lates', [10925, 65024]], ['lbarr', [10508]], ['lBarr', [10510]], ['lbbrk', [10098]], ['lbrace', [123]], ['lbrack', [91]], ['lbrke', [10635]], ['lbrksld', [10639]], ['lbrkslu', [10637]], ['Lcaron', [317]], ['lcaron', [318]], ['Lcedil', [315]], ['lcedil', [316]], ['lceil', [8968]], ['lcub', [123]], ['Lcy', [1051]], ['lcy', [1083]], ['ldca', [10550]], ['ldquo', [8220]], ['ldquor', [8222]], ['ldrdhar', [10599]], ['ldrushar', [10571]], ['ldsh', [8626]], ['le', [8804]], ['lE', [8806]], ['LeftAngleBracket', [10216]], ['LeftArrowBar', [8676]], ['leftarrow', [8592]], ['LeftArrow', [8592]], ['Leftarrow', [8656]], ['LeftArrowRightArrow', [8646]], ['leftarrowtail', [8610]], ['LeftCeiling', [8968]], ['LeftDoubleBracket', [10214]], ['LeftDownTeeVector', [10593]], ['LeftDownVectorBar', [10585]], ['LeftDownVector', [8643]], ['LeftFloor', [8970]], ['leftharpoondown', [8637]], ['leftharpoonup', [8636]], ['leftleftarrows', [8647]], ['leftrightarrow', [8596]], ['LeftRightArrow', [8596]], ['Leftrightarrow', [8660]], ['leftrightarrows', [8646]], ['leftrightharpoons', [8651]], ['leftrightsquigarrow', [8621]], ['LeftRightVector', [10574]], ['LeftTeeArrow', [8612]], ['LeftTee', [8867]], ['LeftTeeVector', [10586]], ['leftthreetimes', [8907]], ['LeftTriangleBar', [10703]], ['LeftTriangle', [8882]], ['LeftTriangleEqual', [8884]], ['LeftUpDownVector', [10577]], ['LeftUpTeeVector', [10592]], ['LeftUpVectorBar', [10584]], ['LeftUpVector', [8639]], ['LeftVectorBar', [10578]], ['LeftVector', [8636]], ['lEg', [10891]], ['leg', [8922]], ['leq', [8804]], ['leqq', [8806]], ['leqslant', [10877]], ['lescc', [10920]], ['les', [10877]], ['lesdot', [10879]], ['lesdoto', [10881]], ['lesdotor', [10883]], ['lesg', [8922, 65024]], ['lesges', [10899]], ['lessapprox', [10885]], ['lessdot', [8918]], ['lesseqgtr', [8922]], ['lesseqqgtr', [10891]], ['LessEqualGreater', [8922]], ['LessFullEqual', [8806]], ['LessGreater', [8822]], ['lessgtr', [8822]], ['LessLess', [10913]], ['lesssim', [8818]], ['LessSlantEqual', [10877]], ['LessTilde', [8818]], ['lfisht', [10620]], ['lfloor', [8970]], ['Lfr', [120079]], ['lfr', [120105]], ['lg', [8822]], ['lgE', [10897]], ['lHar', [10594]], ['lhard', [8637]], ['lharu', [8636]], ['lharul', [10602]], ['lhblk', [9604]], ['LJcy', [1033]], ['ljcy', [1113]], ['llarr', [8647]], ['ll', [8810]], ['Ll', [8920]], ['llcorner', [8990]], ['Lleftarrow', [8666]], ['llhard', [10603]], ['lltri', [9722]], ['Lmidot', [319]], ['lmidot', [320]], ['lmoustache', [9136]], ['lmoust', [9136]], ['lnap', [10889]], ['lnapprox', [10889]], ['lne', [10887]], ['lnE', [8808]], ['lneq', [10887]], ['lneqq', [8808]], ['lnsim', [8934]], ['loang', [10220]], ['loarr', [8701]], ['lobrk', [10214]], ['longleftarrow', [10229]], ['LongLeftArrow', [10229]], ['Longleftarrow', [10232]], ['longleftrightarrow', [10231]], ['LongLeftRightArrow', [10231]], ['Longleftrightarrow', [10234]], ['longmapsto', [10236]], ['longrightarrow', [10230]], ['LongRightArrow', [10230]], ['Longrightarrow', [10233]], ['looparrowleft', [8619]], ['looparrowright', [8620]], ['lopar', [10629]], ['Lopf', [120131]], ['lopf', [120157]], ['loplus', [10797]], ['lotimes', [10804]], ['lowast', [8727]], ['lowbar', [95]], ['LowerLeftArrow', [8601]], ['LowerRightArrow', [8600]], ['loz', [9674]], ['lozenge', [9674]], ['lozf', [10731]], ['lpar', [40]], ['lparlt', [10643]], ['lrarr', [8646]], ['lrcorner', [8991]], ['lrhar', [8651]], ['lrhard', [10605]], ['lrm', [8206]], ['lrtri', [8895]], ['lsaquo', [8249]], ['lscr', [120001]], ['Lscr', [8466]], ['lsh', [8624]], ['Lsh', [8624]], ['lsim', [8818]], ['lsime', [10893]], ['lsimg', [10895]], ['lsqb', [91]], ['lsquo', [8216]], ['lsquor', [8218]], ['Lstrok', [321]], ['lstrok', [322]], ['ltcc', [10918]], ['ltcir', [10873]], ['lt', [60]], ['LT', [60]], ['Lt', [8810]], ['ltdot', [8918]], ['lthree', [8907]], ['ltimes', [8905]], ['ltlarr', [10614]], ['ltquest', [10875]], ['ltri', [9667]], ['ltrie', [8884]], ['ltrif', [9666]], ['ltrPar', [10646]], ['lurdshar', [10570]], ['luruhar', [10598]], ['lvertneqq', [8808, 65024]], ['lvnE', [8808, 65024]], ['macr', [175]], ['male', [9794]], ['malt', [10016]], ['maltese', [10016]], ['Map', [10501]], ['map', [8614]], ['mapsto', [8614]], ['mapstodown', [8615]], ['mapstoleft', [8612]], ['mapstoup', [8613]], ['marker', [9646]], ['mcomma', [10793]], ['Mcy', [1052]], ['mcy', [1084]], ['mdash', [8212]], ['mDDot', [8762]], ['measuredangle', [8737]], ['MediumSpace', [8287]], ['Mellintrf', [8499]], ['Mfr', [120080]], ['mfr', [120106]], ['mho', [8487]], ['micro', [181]], ['midast', [42]], ['midcir', [10992]], ['mid', [8739]], ['middot', [183]], ['minusb', [8863]], ['minus', [8722]], ['minusd', [8760]], ['minusdu', [10794]], ['MinusPlus', [8723]], ['mlcp', [10971]], ['mldr', [8230]], ['mnplus', [8723]], ['models', [8871]], ['Mopf', [120132]], ['mopf', [120158]], ['mp', [8723]], ['mscr', [120002]], ['Mscr', [8499]], ['mstpos', [8766]], ['Mu', [924]], ['mu', [956]], ['multimap', [8888]], ['mumap', [8888]], ['nabla', [8711]], ['Nacute', [323]], ['nacute', [324]], ['nang', [8736, 8402]], ['nap', [8777]], ['napE', [10864, 824]], ['napid', [8779, 824]], ['napos', [329]], ['napprox', [8777]], ['natural', [9838]], ['naturals', [8469]], ['natur', [9838]], ['nbsp', [160]], ['nbump', [8782, 824]], ['nbumpe', [8783, 824]], ['ncap', [10819]], ['Ncaron', [327]], ['ncaron', [328]], ['Ncedil', [325]], ['ncedil', [326]], ['ncong', [8775]], ['ncongdot', [10861, 824]], ['ncup', [10818]], ['Ncy', [1053]], ['ncy', [1085]], ['ndash', [8211]], ['nearhk', [10532]], ['nearr', [8599]], ['neArr', [8663]], ['nearrow', [8599]], ['ne', [8800]], ['nedot', [8784, 824]], ['NegativeMediumSpace', [8203]], ['NegativeThickSpace', [8203]], ['NegativeThinSpace', [8203]], ['NegativeVeryThinSpace', [8203]], ['nequiv', [8802]], ['nesear', [10536]], ['nesim', [8770, 824]], ['NestedGreaterGreater', [8811]], ['NestedLessLess', [8810]], ['nexist', [8708]], ['nexists', [8708]], ['Nfr', [120081]], ['nfr', [120107]], ['ngE', [8807, 824]], ['nge', [8817]], ['ngeq', [8817]], ['ngeqq', [8807, 824]], ['ngeqslant', [10878, 824]], ['nges', [10878, 824]], ['nGg', [8921, 824]], ['ngsim', [8821]], ['nGt', [8811, 8402]], ['ngt', [8815]], ['ngtr', [8815]], ['nGtv', [8811, 824]], ['nharr', [8622]], ['nhArr', [8654]], ['nhpar', [10994]], ['ni', [8715]], ['nis', [8956]], ['nisd', [8954]], ['niv', [8715]], ['NJcy', [1034]], ['njcy', [1114]], ['nlarr', [8602]], ['nlArr', [8653]], ['nldr', [8229]], ['nlE', [8806, 824]], ['nle', [8816]], ['nleftarrow', [8602]], ['nLeftarrow', [8653]], ['nleftrightarrow', [8622]], ['nLeftrightarrow', [8654]], ['nleq', [8816]], ['nleqq', [8806, 824]], ['nleqslant', [10877, 824]], ['nles', [10877, 824]], ['nless', [8814]], ['nLl', [8920, 824]], ['nlsim', [8820]], ['nLt', [8810, 8402]], ['nlt', [8814]], ['nltri', [8938]], ['nltrie', [8940]], ['nLtv', [8810, 824]], ['nmid', [8740]], ['NoBreak', [8288]], ['NonBreakingSpace', [160]], ['nopf', [120159]], ['Nopf', [8469]], ['Not', [10988]], ['not', [172]], ['NotCongruent', [8802]], ['NotCupCap', [8813]], ['NotDoubleVerticalBar', [8742]], ['NotElement', [8713]], ['NotEqual', [8800]], ['NotEqualTilde', [8770, 824]], ['NotExists', [8708]], ['NotGreater', [8815]], ['NotGreaterEqual', [8817]], ['NotGreaterFullEqual', [8807, 824]], ['NotGreaterGreater', [8811, 824]], ['NotGreaterLess', [8825]], ['NotGreaterSlantEqual', [10878, 824]], ['NotGreaterTilde', [8821]], ['NotHumpDownHump', [8782, 824]], ['NotHumpEqual', [8783, 824]], ['notin', [8713]], ['notindot', [8949, 824]], ['notinE', [8953, 824]], ['notinva', [8713]], ['notinvb', [8951]], ['notinvc', [8950]], ['NotLeftTriangleBar', [10703, 824]], ['NotLeftTriangle', [8938]], ['NotLeftTriangleEqual', [8940]], ['NotLess', [8814]], ['NotLessEqual', [8816]], ['NotLessGreater', [8824]], ['NotLessLess', [8810, 824]], ['NotLessSlantEqual', [10877, 824]], ['NotLessTilde', [8820]], ['NotNestedGreaterGreater', [10914, 824]], ['NotNestedLessLess', [10913, 824]], ['notni', [8716]], ['notniva', [8716]], ['notnivb', [8958]], ['notnivc', [8957]], ['NotPrecedes', [8832]], ['NotPrecedesEqual', [10927, 824]], ['NotPrecedesSlantEqual', [8928]], ['NotReverseElement', [8716]], ['NotRightTriangleBar', [10704, 824]], ['NotRightTriangle', [8939]], ['NotRightTriangleEqual', [8941]], ['NotSquareSubset', [8847, 824]], ['NotSquareSubsetEqual', [8930]], ['NotSquareSuperset', [8848, 824]], ['NotSquareSupersetEqual', [8931]], ['NotSubset', [8834, 8402]], ['NotSubsetEqual', [8840]], ['NotSucceeds', [8833]], ['NotSucceedsEqual', [10928, 824]], ['NotSucceedsSlantEqual', [8929]], ['NotSucceedsTilde', [8831, 824]], ['NotSuperset', [8835, 8402]], ['NotSupersetEqual', [8841]], ['NotTilde', [8769]], ['NotTildeEqual', [8772]], ['NotTildeFullEqual', [8775]], ['NotTildeTilde', [8777]], ['NotVerticalBar', [8740]], ['nparallel', [8742]], ['npar', [8742]], ['nparsl', [11005, 8421]], ['npart', [8706, 824]], ['npolint', [10772]], ['npr', [8832]], ['nprcue', [8928]], ['nprec', [8832]], ['npreceq', [10927, 824]], ['npre', [10927, 824]], ['nrarrc', [10547, 824]], ['nrarr', [8603]], ['nrArr', [8655]], ['nrarrw', [8605, 824]], ['nrightarrow', [8603]], ['nRightarrow', [8655]], ['nrtri', [8939]], ['nrtrie', [8941]], ['nsc', [8833]], ['nsccue', [8929]], ['nsce', [10928, 824]], ['Nscr', [119977]], ['nscr', [120003]], ['nshortmid', [8740]], ['nshortparallel', [8742]], ['nsim', [8769]], ['nsime', [8772]], ['nsimeq', [8772]], ['nsmid', [8740]], ['nspar', [8742]], ['nsqsube', [8930]], ['nsqsupe', [8931]], ['nsub', [8836]], ['nsubE', [10949, 824]], ['nsube', [8840]], ['nsubset', [8834, 8402]], ['nsubseteq', [8840]], ['nsubseteqq', [10949, 824]], ['nsucc', [8833]], ['nsucceq', [10928, 824]], ['nsup', [8837]], ['nsupE', [10950, 824]], ['nsupe', [8841]], ['nsupset', [8835, 8402]], ['nsupseteq', [8841]], ['nsupseteqq', [10950, 824]], ['ntgl', [8825]], ['Ntilde', [209]], ['ntilde', [241]], ['ntlg', [8824]], ['ntriangleleft', [8938]], ['ntrianglelefteq', [8940]], ['ntriangleright', [8939]], ['ntrianglerighteq', [8941]], ['Nu', [925]], ['nu', [957]], ['num', [35]], ['numero', [8470]], ['numsp', [8199]], ['nvap', [8781, 8402]], ['nvdash', [8876]], ['nvDash', [8877]], ['nVdash', [8878]], ['nVDash', [8879]], ['nvge', [8805, 8402]], ['nvgt', [62, 8402]], ['nvHarr', [10500]], ['nvinfin', [10718]], ['nvlArr', [10498]], ['nvle', [8804, 8402]], ['nvlt', [60, 8402]], ['nvltrie', [8884, 8402]], ['nvrArr', [10499]], ['nvrtrie', [8885, 8402]], ['nvsim', [8764, 8402]], ['nwarhk', [10531]], ['nwarr', [8598]], ['nwArr', [8662]], ['nwarrow', [8598]], ['nwnear', [10535]], ['Oacute', [211]], ['oacute', [243]], ['oast', [8859]], ['Ocirc', [212]], ['ocirc', [244]], ['ocir', [8858]], ['Ocy', [1054]], ['ocy', [1086]], ['odash', [8861]], ['Odblac', [336]], ['odblac', [337]], ['odiv', [10808]], ['odot', [8857]], ['odsold', [10684]], ['OElig', [338]], ['oelig', [339]], ['ofcir', [10687]], ['Ofr', [120082]], ['ofr', [120108]], ['ogon', [731]], ['Ograve', [210]], ['ograve', [242]], ['ogt', [10689]], ['ohbar', [10677]], ['ohm', [937]], ['oint', [8750]], ['olarr', [8634]], ['olcir', [10686]], ['olcross', [10683]], ['oline', [8254]], ['olt', [10688]], ['Omacr', [332]], ['omacr', [333]], ['Omega', [937]], ['omega', [969]], ['Omicron', [927]], ['omicron', [959]], ['omid', [10678]], ['ominus', [8854]], ['Oopf', [120134]], ['oopf', [120160]], ['opar', [10679]], ['OpenCurlyDoubleQuote', [8220]], ['OpenCurlyQuote', [8216]], ['operp', [10681]], ['oplus', [8853]], ['orarr', [8635]], ['Or', [10836]], ['or', [8744]], ['ord', [10845]], ['order', [8500]], ['orderof', [8500]], ['ordf', [170]], ['ordm', [186]], ['origof', [8886]], ['oror', [10838]], ['orslope', [10839]], ['orv', [10843]], ['oS', [9416]], ['Oscr', [119978]], ['oscr', [8500]], ['Oslash', [216]], ['oslash', [248]], ['osol', [8856]], ['Otilde', [213]], ['otilde', [245]], ['otimesas', [10806]], ['Otimes', [10807]], ['otimes', [8855]], ['Ouml', [214]], ['ouml', [246]], ['ovbar', [9021]], ['OverBar', [8254]], ['OverBrace', [9182]], ['OverBracket', [9140]], ['OverParenthesis', [9180]], ['para', [182]], ['parallel', [8741]], ['par', [8741]], ['parsim', [10995]], ['parsl', [11005]], ['part', [8706]], ['PartialD', [8706]], ['Pcy', [1055]], ['pcy', [1087]], ['percnt', [37]], ['period', [46]], ['permil', [8240]], ['perp', [8869]], ['pertenk', [8241]], ['Pfr', [120083]], ['pfr', [120109]], ['Phi', [934]], ['phi', [966]], ['phiv', [981]], ['phmmat', [8499]], ['phone', [9742]], ['Pi', [928]], ['pi', [960]], ['pitchfork', [8916]], ['piv', [982]], ['planck', [8463]], ['planckh', [8462]], ['plankv', [8463]], ['plusacir', [10787]], ['plusb', [8862]], ['pluscir', [10786]], ['plus', [43]], ['plusdo', [8724]], ['plusdu', [10789]], ['pluse', [10866]], ['PlusMinus', [177]], ['plusmn', [177]], ['plussim', [10790]], ['plustwo', [10791]], ['pm', [177]], ['Poincareplane', [8460]], ['pointint', [10773]], ['popf', [120161]], ['Popf', [8473]], ['pound', [163]], ['prap', [10935]], ['Pr', [10939]], ['pr', [8826]], ['prcue', [8828]], ['precapprox', [10935]], ['prec', [8826]], ['preccurlyeq', [8828]], ['Precedes', [8826]], ['PrecedesEqual', [10927]], ['PrecedesSlantEqual', [8828]], ['PrecedesTilde', [8830]], ['preceq', [10927]], ['precnapprox', [10937]], ['precneqq', [10933]], ['precnsim', [8936]], ['pre', [10927]], ['prE', [10931]], ['precsim', [8830]], ['prime', [8242]], ['Prime', [8243]], ['primes', [8473]], ['prnap', [10937]], ['prnE', [10933]], ['prnsim', [8936]], ['prod', [8719]], ['Product', [8719]], ['profalar', [9006]], ['profline', [8978]], ['profsurf', [8979]], ['prop', [8733]], ['Proportional', [8733]], ['Proportion', [8759]], ['propto', [8733]], ['prsim', [8830]], ['prurel', [8880]], ['Pscr', [119979]], ['pscr', [120005]], ['Psi', [936]], ['psi', [968]], ['puncsp', [8200]], ['Qfr', [120084]], ['qfr', [120110]], ['qint', [10764]], ['qopf', [120162]], ['Qopf', [8474]], ['qprime', [8279]], ['Qscr', [119980]], ['qscr', [120006]], ['quaternions', [8461]], ['quatint', [10774]], ['quest', [63]], ['questeq', [8799]], ['quot', [34]], ['QUOT', [34]], ['rAarr', [8667]], ['race', [8765, 817]], ['Racute', [340]], ['racute', [341]], ['radic', [8730]], ['raemptyv', [10675]], ['rang', [10217]], ['Rang', [10219]], ['rangd', [10642]], ['range', [10661]], ['rangle', [10217]], ['raquo', [187]], ['rarrap', [10613]], ['rarrb', [8677]], ['rarrbfs', [10528]], ['rarrc', [10547]], ['rarr', [8594]], ['Rarr', [8608]], ['rArr', [8658]], ['rarrfs', [10526]], ['rarrhk', [8618]], ['rarrlp', [8620]], ['rarrpl', [10565]], ['rarrsim', [10612]], ['Rarrtl', [10518]], ['rarrtl', [8611]], ['rarrw', [8605]], ['ratail', [10522]], ['rAtail', [10524]], ['ratio', [8758]], ['rationals', [8474]], ['rbarr', [10509]], ['rBarr', [10511]], ['RBarr', [10512]], ['rbbrk', [10099]], ['rbrace', [125]], ['rbrack', [93]], ['rbrke', [10636]], ['rbrksld', [10638]], ['rbrkslu', [10640]], ['Rcaron', [344]], ['rcaron', [345]], ['Rcedil', [342]], ['rcedil', [343]], ['rceil', [8969]], ['rcub', [125]], ['Rcy', [1056]], ['rcy', [1088]], ['rdca', [10551]], ['rdldhar', [10601]], ['rdquo', [8221]], ['rdquor', [8221]], ['CloseCurlyDoubleQuote', [8221]], ['rdsh', [8627]], ['real', [8476]], ['realine', [8475]], ['realpart', [8476]], ['reals', [8477]], ['Re', [8476]], ['rect', [9645]], ['reg', [174]], ['REG', [174]], ['ReverseElement', [8715]], ['ReverseEquilibrium', [8651]], ['ReverseUpEquilibrium', [10607]], ['rfisht', [10621]], ['rfloor', [8971]], ['rfr', [120111]], ['Rfr', [8476]], ['rHar', [10596]], ['rhard', [8641]], ['rharu', [8640]], ['rharul', [10604]], ['Rho', [929]], ['rho', [961]], ['rhov', [1009]], ['RightAngleBracket', [10217]], ['RightArrowBar', [8677]], ['rightarrow', [8594]], ['RightArrow', [8594]], ['Rightarrow', [8658]], ['RightArrowLeftArrow', [8644]], ['rightarrowtail', [8611]], ['RightCeiling', [8969]], ['RightDoubleBracket', [10215]], ['RightDownTeeVector', [10589]], ['RightDownVectorBar', [10581]], ['RightDownVector', [8642]], ['RightFloor', [8971]], ['rightharpoondown', [8641]], ['rightharpoonup', [8640]], ['rightleftarrows', [8644]], ['rightleftharpoons', [8652]], ['rightrightarrows', [8649]], ['rightsquigarrow', [8605]], ['RightTeeArrow', [8614]], ['RightTee', [8866]], ['RightTeeVector', [10587]], ['rightthreetimes', [8908]], ['RightTriangleBar', [10704]], ['RightTriangle', [8883]], ['RightTriangleEqual', [8885]], ['RightUpDownVector', [10575]], ['RightUpTeeVector', [10588]], ['RightUpVectorBar', [10580]], ['RightUpVector', [8638]], ['RightVectorBar', [10579]], ['RightVector', [8640]], ['ring', [730]], ['risingdotseq', [8787]], ['rlarr', [8644]], ['rlhar', [8652]], ['rlm', [8207]], ['rmoustache', [9137]], ['rmoust', [9137]], ['rnmid', [10990]], ['roang', [10221]], ['roarr', [8702]], ['robrk', [10215]], ['ropar', [10630]], ['ropf', [120163]], ['Ropf', [8477]], ['roplus', [10798]], ['rotimes', [10805]], ['RoundImplies', [10608]], ['rpar', [41]], ['rpargt', [10644]], ['rppolint', [10770]], ['rrarr', [8649]], ['Rrightarrow', [8667]], ['rsaquo', [8250]], ['rscr', [120007]], ['Rscr', [8475]], ['rsh', [8625]], ['Rsh', [8625]], ['rsqb', [93]], ['rsquo', [8217]], ['rsquor', [8217]], ['CloseCurlyQuote', [8217]], ['rthree', [8908]], ['rtimes', [8906]], ['rtri', [9657]], ['rtrie', [8885]], ['rtrif', [9656]], ['rtriltri', [10702]], ['RuleDelayed', [10740]], ['ruluhar', [10600]], ['rx', [8478]], ['Sacute', [346]], ['sacute', [347]], ['sbquo', [8218]], ['scap', [10936]], ['Scaron', [352]], ['scaron', [353]], ['Sc', [10940]], ['sc', [8827]], ['sccue', [8829]], ['sce', [10928]], ['scE', [10932]], ['Scedil', [350]], ['scedil', [351]], ['Scirc', [348]], ['scirc', [349]], ['scnap', [10938]], ['scnE', [10934]], ['scnsim', [8937]], ['scpolint', [10771]], ['scsim', [8831]], ['Scy', [1057]], ['scy', [1089]], ['sdotb', [8865]], ['sdot', [8901]], ['sdote', [10854]], ['searhk', [10533]], ['searr', [8600]], ['seArr', [8664]], ['searrow', [8600]], ['sect', [167]], ['semi', [59]], ['seswar', [10537]], ['setminus', [8726]], ['setmn', [8726]], ['sext', [10038]], ['Sfr', [120086]], ['sfr', [120112]], ['sfrown', [8994]], ['sharp', [9839]], ['SHCHcy', [1065]], ['shchcy', [1097]], ['SHcy', [1064]], ['shcy', [1096]], ['ShortDownArrow', [8595]], ['ShortLeftArrow', [8592]], ['shortmid', [8739]], ['shortparallel', [8741]], ['ShortRightArrow', [8594]], ['ShortUpArrow', [8593]], ['shy', [173]], ['Sigma', [931]], ['sigma', [963]], ['sigmaf', [962]], ['sigmav', [962]], ['sim', [8764]], ['simdot', [10858]], ['sime', [8771]], ['simeq', [8771]], ['simg', [10910]], ['simgE', [10912]], ['siml', [10909]], ['simlE', [10911]], ['simne', [8774]], ['simplus', [10788]], ['simrarr', [10610]], ['slarr', [8592]], ['SmallCircle', [8728]], ['smallsetminus', [8726]], ['smashp', [10803]], ['smeparsl', [10724]], ['smid', [8739]], ['smile', [8995]], ['smt', [10922]], ['smte', [10924]], ['smtes', [10924, 65024]], ['SOFTcy', [1068]], ['softcy', [1100]], ['solbar', [9023]], ['solb', [10692]], ['sol', [47]], ['Sopf', [120138]], ['sopf', [120164]], ['spades', [9824]], ['spadesuit', [9824]], ['spar', [8741]], ['sqcap', [8851]], ['sqcaps', [8851, 65024]], ['sqcup', [8852]], ['sqcups', [8852, 65024]], ['Sqrt', [8730]], ['sqsub', [8847]], ['sqsube', [8849]], ['sqsubset', [8847]], ['sqsubseteq', [8849]], ['sqsup', [8848]], ['sqsupe', [8850]], ['sqsupset', [8848]], ['sqsupseteq', [8850]], ['square', [9633]], ['Square', [9633]], ['SquareIntersection', [8851]], ['SquareSubset', [8847]], ['SquareSubsetEqual', [8849]], ['SquareSuperset', [8848]], ['SquareSupersetEqual', [8850]], ['SquareUnion', [8852]], ['squarf', [9642]], ['squ', [9633]], ['squf', [9642]], ['srarr', [8594]], ['Sscr', [119982]], ['sscr', [120008]], ['ssetmn', [8726]], ['ssmile', [8995]], ['sstarf', [8902]], ['Star', [8902]], ['star', [9734]], ['starf', [9733]], ['straightepsilon', [1013]], ['straightphi', [981]], ['strns', [175]], ['sub', [8834]], ['Sub', [8912]], ['subdot', [10941]], ['subE', [10949]], ['sube', [8838]], ['subedot', [10947]], ['submult', [10945]], ['subnE', [10955]], ['subne', [8842]], ['subplus', [10943]], ['subrarr', [10617]], ['subset', [8834]], ['Subset', [8912]], ['subseteq', [8838]], ['subseteqq', [10949]], ['SubsetEqual', [8838]], ['subsetneq', [8842]], ['subsetneqq', [10955]], ['subsim', [10951]], ['subsub', [10965]], ['subsup', [10963]], ['succapprox', [10936]], ['succ', [8827]], ['succcurlyeq', [8829]], ['Succeeds', [8827]], ['SucceedsEqual', [10928]], ['SucceedsSlantEqual', [8829]], ['SucceedsTilde', [8831]], ['succeq', [10928]], ['succnapprox', [10938]], ['succneqq', [10934]], ['succnsim', [8937]], ['succsim', [8831]], ['SuchThat', [8715]], ['sum', [8721]], ['Sum', [8721]], ['sung', [9834]], ['sup1', [185]], ['sup2', [178]], ['sup3', [179]], ['sup', [8835]], ['Sup', [8913]], ['supdot', [10942]], ['supdsub', [10968]], ['supE', [10950]], ['supe', [8839]], ['supedot', [10948]], ['Superset', [8835]], ['SupersetEqual', [8839]], ['suphsol', [10185]], ['suphsub', [10967]], ['suplarr', [10619]], ['supmult', [10946]], ['supnE', [10956]], ['supne', [8843]], ['supplus', [10944]], ['supset', [8835]], ['Supset', [8913]], ['supseteq', [8839]], ['supseteqq', [10950]], ['supsetneq', [8843]], ['supsetneqq', [10956]], ['supsim', [10952]], ['supsub', [10964]], ['supsup', [10966]], ['swarhk', [10534]], ['swarr', [8601]], ['swArr', [8665]], ['swarrow', [8601]], ['swnwar', [10538]], ['szlig', [223]], ['Tab', [9]], ['target', [8982]], ['Tau', [932]], ['tau', [964]], ['tbrk', [9140]], ['Tcaron', [356]], ['tcaron', [357]], ['Tcedil', [354]], ['tcedil', [355]], ['Tcy', [1058]], ['tcy', [1090]], ['tdot', [8411]], ['telrec', [8981]], ['Tfr', [120087]], ['tfr', [120113]], ['there4', [8756]], ['therefore', [8756]], ['Therefore', [8756]], ['Theta', [920]], ['theta', [952]], ['thetasym', [977]], ['thetav', [977]], ['thickapprox', [8776]], ['thicksim', [8764]], ['ThickSpace', [8287, 8202]], ['ThinSpace', [8201]], ['thinsp', [8201]], ['thkap', [8776]], ['thksim', [8764]], ['THORN', [222]], ['thorn', [254]], ['tilde', [732]], ['Tilde', [8764]], ['TildeEqual', [8771]], ['TildeFullEqual', [8773]], ['TildeTilde', [8776]], ['timesbar', [10801]], ['timesb', [8864]], ['times', [215]], ['timesd', [10800]], ['tint', [8749]], ['toea', [10536]], ['topbot', [9014]], ['topcir', [10993]], ['top', [8868]], ['Topf', [120139]], ['topf', [120165]], ['topfork', [10970]], ['tosa', [10537]], ['tprime', [8244]], ['trade', [8482]], ['TRADE', [8482]], ['triangle', [9653]], ['triangledown', [9663]], ['triangleleft', [9667]], ['trianglelefteq', [8884]], ['triangleq', [8796]], ['triangleright', [9657]], ['trianglerighteq', [8885]], ['tridot', [9708]], ['trie', [8796]], ['triminus', [10810]], ['TripleDot', [8411]], ['triplus', [10809]], ['trisb', [10701]], ['tritime', [10811]], ['trpezium', [9186]], ['Tscr', [119983]], ['tscr', [120009]], ['TScy', [1062]], ['tscy', [1094]], ['TSHcy', [1035]], ['tshcy', [1115]], ['Tstrok', [358]], ['tstrok', [359]], ['twixt', [8812]], ['twoheadleftarrow', [8606]], ['twoheadrightarrow', [8608]], ['Uacute', [218]], ['uacute', [250]], ['uarr', [8593]], ['Uarr', [8607]], ['uArr', [8657]], ['Uarrocir', [10569]], ['Ubrcy', [1038]], ['ubrcy', [1118]], ['Ubreve', [364]], ['ubreve', [365]], ['Ucirc', [219]], ['ucirc', [251]], ['Ucy', [1059]], ['ucy', [1091]], ['udarr', [8645]], ['Udblac', [368]], ['udblac', [369]], ['udhar', [10606]], ['ufisht', [10622]], ['Ufr', [120088]], ['ufr', [120114]], ['Ugrave', [217]], ['ugrave', [249]], ['uHar', [10595]], ['uharl', [8639]], ['uharr', [8638]], ['uhblk', [9600]], ['ulcorn', [8988]], ['ulcorner', [8988]], ['ulcrop', [8975]], ['ultri', [9720]], ['Umacr', [362]], ['umacr', [363]], ['uml', [168]], ['UnderBar', [95]], ['UnderBrace', [9183]], ['UnderBracket', [9141]], ['UnderParenthesis', [9181]], ['Union', [8899]], ['UnionPlus', [8846]], ['Uogon', [370]], ['uogon', [371]], ['Uopf', [120140]], ['uopf', [120166]], ['UpArrowBar', [10514]], ['uparrow', [8593]], ['UpArrow', [8593]], ['Uparrow', [8657]], ['UpArrowDownArrow', [8645]], ['updownarrow', [8597]], ['UpDownArrow', [8597]], ['Updownarrow', [8661]], ['UpEquilibrium', [10606]], ['upharpoonleft', [8639]], ['upharpoonright', [8638]], ['uplus', [8846]], ['UpperLeftArrow', [8598]], ['UpperRightArrow', [8599]], ['upsi', [965]], ['Upsi', [978]], ['upsih', [978]], ['Upsilon', [933]], ['upsilon', [965]], ['UpTeeArrow', [8613]], ['UpTee', [8869]], ['upuparrows', [8648]], ['urcorn', [8989]], ['urcorner', [8989]], ['urcrop', [8974]], ['Uring', [366]], ['uring', [367]], ['urtri', [9721]], ['Uscr', [119984]], ['uscr', [120010]], ['utdot', [8944]], ['Utilde', [360]], ['utilde', [361]], ['utri', [9653]], ['utrif', [9652]], ['uuarr', [8648]], ['Uuml', [220]], ['uuml', [252]], ['uwangle', [10663]], ['vangrt', [10652]], ['varepsilon', [1013]], ['varkappa', [1008]], ['varnothing', [8709]], ['varphi', [981]], ['varpi', [982]], ['varpropto', [8733]], ['varr', [8597]], ['vArr', [8661]], ['varrho', [1009]], ['varsigma', [962]], ['varsubsetneq', [8842, 65024]], ['varsubsetneqq', [10955, 65024]], ['varsupsetneq', [8843, 65024]], ['varsupsetneqq', [10956, 65024]], ['vartheta', [977]], ['vartriangleleft', [8882]], ['vartriangleright', [8883]], ['vBar', [10984]], ['Vbar', [10987]], ['vBarv', [10985]], ['Vcy', [1042]], ['vcy', [1074]], ['vdash', [8866]], ['vDash', [8872]], ['Vdash', [8873]], ['VDash', [8875]], ['Vdashl', [10982]], ['veebar', [8891]], ['vee', [8744]], ['Vee', [8897]], ['veeeq', [8794]], ['vellip', [8942]], ['verbar', [124]], ['Verbar', [8214]], ['vert', [124]], ['Vert', [8214]], ['VerticalBar', [8739]], ['VerticalLine', [124]], ['VerticalSeparator', [10072]], ['VerticalTilde', [8768]], ['VeryThinSpace', [8202]], ['Vfr', [120089]], ['vfr', [120115]], ['vltri', [8882]], ['vnsub', [8834, 8402]], ['vnsup', [8835, 8402]], ['Vopf', [120141]], ['vopf', [120167]], ['vprop', [8733]], ['vrtri', [8883]], ['Vscr', [119985]], ['vscr', [120011]], ['vsubnE', [10955, 65024]], ['vsubne', [8842, 65024]], ['vsupnE', [10956, 65024]], ['vsupne', [8843, 65024]], ['Vvdash', [8874]], ['vzigzag', [10650]], ['Wcirc', [372]], ['wcirc', [373]], ['wedbar', [10847]], ['wedge', [8743]], ['Wedge', [8896]], ['wedgeq', [8793]], ['weierp', [8472]], ['Wfr', [120090]], ['wfr', [120116]], ['Wopf', [120142]], ['wopf', [120168]], ['wp', [8472]], ['wr', [8768]], ['wreath', [8768]], ['Wscr', [119986]], ['wscr', [120012]], ['xcap', [8898]], ['xcirc', [9711]], ['xcup', [8899]], ['xdtri', [9661]], ['Xfr', [120091]], ['xfr', [120117]], ['xharr', [10231]], ['xhArr', [10234]], ['Xi', [926]], ['xi', [958]], ['xlarr', [10229]], ['xlArr', [10232]], ['xmap', [10236]], ['xnis', [8955]], ['xodot', [10752]], ['Xopf', [120143]], ['xopf', [120169]], ['xoplus', [10753]], ['xotime', [10754]], ['xrarr', [10230]], ['xrArr', [10233]], ['Xscr', [119987]], ['xscr', [120013]], ['xsqcup', [10758]], ['xuplus', [10756]], ['xutri', [9651]], ['xvee', [8897]], ['xwedge', [8896]], ['Yacute', [221]], ['yacute', [253]], ['YAcy', [1071]], ['yacy', [1103]], ['Ycirc', [374]], ['ycirc', [375]], ['Ycy', [1067]], ['ycy', [1099]], ['yen', [165]], ['Yfr', [120092]], ['yfr', [120118]], ['YIcy', [1031]], ['yicy', [1111]], ['Yopf', [120144]], ['yopf', [120170]], ['Yscr', [119988]], ['yscr', [120014]], ['YUcy', [1070]], ['yucy', [1102]], ['yuml', [255]], ['Yuml', [376]], ['Zacute', [377]], ['zacute', [378]], ['Zcaron', [381]], ['zcaron', [382]], ['Zcy', [1047]], ['zcy', [1079]], ['Zdot', [379]], ['zdot', [380]], ['zeetrf', [8488]], ['ZeroWidthSpace', [8203]], ['Zeta', [918]], ['zeta', [950]], ['zfr', [120119]], ['Zfr', [8488]], ['ZHcy', [1046]], ['zhcy', [1078]], ['zigrarr', [8669]], ['zopf', [120171]], ['Zopf', [8484]], ['Zscr', [119989]], ['zscr', [120015]], ['zwj', [8205]], ['zwnj', [8204]]];
var DECODE_ONLY_ENTITIES = [['NewLine', [10]]];
var alphaIndex = {};
var charIndex = {};
createIndexes(alphaIndex, charIndex);
var Html5Entities = /** @class */ (function () {
    function Html5Entities() {
    }
    Html5Entities.prototype.decode = function (str) {
        if (!str || !str.length) {
            return '';
        }
        return str.replace(/&(#?[\w\d]+);?/g, function (s, entity) {
            var chr;
            if (entity.charAt(0) === "#") {
                var code = entity.charAt(1) === 'x' ?
                    parseInt(entity.substr(2).toLowerCase(), 16) :
                    parseInt(entity.substr(1));
                if (!isNaN(code) || code >= -32768) {
                    if (code <= 65535) {
                        chr = String.fromCharCode(code);
                    }
                    else {
                        chr = surrogate_pairs_1.fromCodePoint(code);
                    }
                }
            }
            else {
                chr = alphaIndex[entity];
            }
            return chr || s;
        });
    };
    Html5Entities.decode = function (str) {
        return new Html5Entities().decode(str);
    };
    Html5Entities.prototype.encode = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var charInfo = charIndex[str.charCodeAt(i)];
            if (charInfo) {
                var alpha = charInfo[str.charCodeAt(i + 1)];
                if (alpha) {
                    i++;
                }
                else {
                    alpha = charInfo[''];
                }
                if (alpha) {
                    result += "&" + alpha + ";";
                    i++;
                    continue;
                }
            }
            result += str.charAt(i);
            i++;
        }
        return result;
    };
    Html5Entities.encode = function (str) {
        return new Html5Entities().encode(str);
    };
    Html5Entities.prototype.encodeNonUTF = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var c = str.charCodeAt(i);
            var charInfo = charIndex[c];
            if (charInfo) {
                var alpha = charInfo[str.charCodeAt(i + 1)];
                if (alpha) {
                    i++;
                }
                else {
                    alpha = charInfo[''];
                }
                if (alpha) {
                    result += "&" + alpha + ";";
                    i++;
                    continue;
                }
            }
            if (c < 32 || c > 126) {
                if (c >= surrogate_pairs_1.highSurrogateFrom && c <= surrogate_pairs_1.highSurrogateTo) {
                    result += '&#' + surrogate_pairs_1.getCodePoint(str, i) + ';';
                    i++;
                }
                else {
                    result += '&#' + c + ';';
                }
            }
            else {
                result += str.charAt(i);
            }
            i++;
        }
        return result;
    };
    Html5Entities.encodeNonUTF = function (str) {
        return new Html5Entities().encodeNonUTF(str);
    };
    Html5Entities.prototype.encodeNonASCII = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var c = str.charCodeAt(i);
            if (c <= 255) {
                result += str[i++];
                continue;
            }
            if (c >= surrogate_pairs_1.highSurrogateFrom && c <= surrogate_pairs_1.highSurrogateTo) {
                result += '&#' + surrogate_pairs_1.getCodePoint(str, i) + ';';
                i += 2;
            }
            else {
                result += '&#' + c + ';';
                i++;
            }
        }
        return result;
    };
    Html5Entities.encodeNonASCII = function (str) {
        return new Html5Entities().encodeNonASCII(str);
    };
    return Html5Entities;
}());
exports.Html5Entities = Html5Entities;
function createIndexes(alphaIndex, charIndex) {
    var i = ENTITIES.length;
    while (i--) {
        var _a = ENTITIES[i], alpha = _a[0], _b = _a[1], chr = _b[0], chr2 = _b[1];
        var addChar = (chr < 32 || chr > 126) || chr === 62 || chr === 60 || chr === 38 || chr === 34 || chr === 39;
        var charInfo = void 0;
        if (addChar) {
            charInfo = charIndex[chr] = charIndex[chr] || {};
        }
        if (chr2) {
            alphaIndex[alpha] = String.fromCharCode(chr) + String.fromCharCode(chr2);
            addChar && (charInfo[chr2] = alpha);
        }
        else {
            alphaIndex[alpha] = String.fromCharCode(chr);
            addChar && (charInfo[''] = alpha);
        }
    }
    i = DECODE_ONLY_ENTITIES.length;
    while (i--) {
        var _c = DECODE_ONLY_ENTITIES[i], alpha = _c[0], _d = _c[1], chr = _d[0], chr2 = _d[1];
        alphaIndex[alpha] = String.fromCharCode(chr) + (chr2 ? String.fromCharCode(chr2) : '');
    }
}


/***/ }),

/***/ "../../node_modules/html-entities/lib/index.js":
/*!*****************************************************!*\
  !*** ../../node_modules/html-entities/lib/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var xml_entities_1 = __webpack_require__(/*! ./xml-entities */ "../../node_modules/html-entities/lib/xml-entities.js");
exports.XmlEntities = xml_entities_1.XmlEntities;
var html4_entities_1 = __webpack_require__(/*! ./html4-entities */ "../../node_modules/html-entities/lib/html4-entities.js");
exports.Html4Entities = html4_entities_1.Html4Entities;
var html5_entities_1 = __webpack_require__(/*! ./html5-entities */ "../../node_modules/html-entities/lib/html5-entities.js");
exports.Html5Entities = html5_entities_1.Html5Entities;
exports.AllHtmlEntities = html5_entities_1.Html5Entities;


/***/ }),

/***/ "../../node_modules/html-entities/lib/surrogate-pairs.js":
/*!***************************************************************!*\
  !*** ../../node_modules/html-entities/lib/surrogate-pairs.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fromCodePoint = String.fromCodePoint || function (astralCodePoint) {
    return String.fromCharCode(Math.floor((astralCodePoint - 0x10000) / 0x400) + 0xD800, (astralCodePoint - 0x10000) % 0x400 + 0xDC00);
};
exports.getCodePoint = String.prototype.codePointAt ?
    function (input, position) {
        return input.codePointAt(position);
    } :
    function (input, position) {
        return (input.charCodeAt(position) - 0xD800) * 0x400
            + input.charCodeAt(position + 1) - 0xDC00 + 0x10000;
    };
exports.highSurrogateFrom = 0xD800;
exports.highSurrogateTo = 0xDBFF;


/***/ }),

/***/ "../../node_modules/html-entities/lib/xml-entities.js":
/*!************************************************************!*\
  !*** ../../node_modules/html-entities/lib/xml-entities.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var surrogate_pairs_1 = __webpack_require__(/*! ./surrogate-pairs */ "../../node_modules/html-entities/lib/surrogate-pairs.js");
var ALPHA_INDEX = {
    '&lt': '<',
    '&gt': '>',
    '&quot': '"',
    '&apos': '\'',
    '&amp': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': '\'',
    '&amp;': '&'
};
var CHAR_INDEX = {
    60: 'lt',
    62: 'gt',
    34: 'quot',
    39: 'apos',
    38: 'amp'
};
var CHAR_S_INDEX = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&apos;',
    '&': '&amp;'
};
var XmlEntities = /** @class */ (function () {
    function XmlEntities() {
    }
    XmlEntities.prototype.encode = function (str) {
        if (!str || !str.length) {
            return '';
        }
        return str.replace(/[<>"'&]/g, function (s) {
            return CHAR_S_INDEX[s];
        });
    };
    XmlEntities.encode = function (str) {
        return new XmlEntities().encode(str);
    };
    XmlEntities.prototype.decode = function (str) {
        if (!str || !str.length) {
            return '';
        }
        return str.replace(/&#?[0-9a-zA-Z]+;?/g, function (s) {
            if (s.charAt(1) === '#') {
                var code = s.charAt(2).toLowerCase() === 'x' ?
                    parseInt(s.substr(3), 16) :
                    parseInt(s.substr(2));
                if (!isNaN(code) || code >= -32768) {
                    if (code <= 65535) {
                        return String.fromCharCode(code);
                    }
                    else {
                        return surrogate_pairs_1.fromCodePoint(code);
                    }
                }
                return '';
            }
            return ALPHA_INDEX[s] || s;
        });
    };
    XmlEntities.decode = function (str) {
        return new XmlEntities().decode(str);
    };
    XmlEntities.prototype.encodeNonUTF = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var c = str.charCodeAt(i);
            var alpha = CHAR_INDEX[c];
            if (alpha) {
                result += "&" + alpha + ";";
                i++;
                continue;
            }
            if (c < 32 || c > 126) {
                if (c >= surrogate_pairs_1.highSurrogateFrom && c <= surrogate_pairs_1.highSurrogateTo) {
                    result += '&#' + surrogate_pairs_1.getCodePoint(str, i) + ';';
                    i++;
                }
                else {
                    result += '&#' + c + ';';
                }
            }
            else {
                result += str.charAt(i);
            }
            i++;
        }
        return result;
    };
    XmlEntities.encodeNonUTF = function (str) {
        return new XmlEntities().encodeNonUTF(str);
    };
    XmlEntities.prototype.encodeNonASCII = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var c = str.charCodeAt(i);
            if (c <= 255) {
                result += str[i++];
                continue;
            }
            if (c >= surrogate_pairs_1.highSurrogateFrom && c <= surrogate_pairs_1.highSurrogateTo) {
                result += '&#' + surrogate_pairs_1.getCodePoint(str, i) + ';';
                i++;
            }
            else {
                result += '&#' + c + ';';
            }
            i++;
        }
        return result;
    };
    XmlEntities.encodeNonASCII = function (str) {
        return new XmlEntities().encodeNonASCII(str);
    };
    return XmlEntities;
}());
exports.XmlEntities = XmlEntities;


/***/ }),

/***/ "../../node_modules/lru-cache/index.js":
/*!*********************************************!*\
  !*** ../../node_modules/lru-cache/index.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


// A linked list to keep track of recently-used-ness
const Yallist = __webpack_require__(/*! yallist */ "../../node_modules/yallist/yallist.js")

const MAX = Symbol('max')
const LENGTH = Symbol('length')
const LENGTH_CALCULATOR = Symbol('lengthCalculator')
const ALLOW_STALE = Symbol('allowStale')
const MAX_AGE = Symbol('maxAge')
const DISPOSE = Symbol('dispose')
const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet')
const LRU_LIST = Symbol('lruList')
const CACHE = Symbol('cache')
const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet')

const naiveLength = () => 1

// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
class LRUCache {
  constructor (options) {
    if (typeof options === 'number')
      options = { max: options }

    if (!options)
      options = {}

    if (options.max && (typeof options.max !== 'number' || options.max < 0))
      throw new TypeError('max must be a non-negative number')
    // Kind of weird to have a default max of Infinity, but oh well.
    const max = this[MAX] = options.max || Infinity

    const lc = options.length || naiveLength
    this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc
    this[ALLOW_STALE] = options.stale || false
    if (options.maxAge && typeof options.maxAge !== 'number')
      throw new TypeError('maxAge must be a number')
    this[MAX_AGE] = options.maxAge || 0
    this[DISPOSE] = options.dispose
    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false
    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false
    this.reset()
  }

  // resize the cache when the max changes.
  set max (mL) {
    if (typeof mL !== 'number' || mL < 0)
      throw new TypeError('max must be a non-negative number')

    this[MAX] = mL || Infinity
    trim(this)
  }
  get max () {
    return this[MAX]
  }

  set allowStale (allowStale) {
    this[ALLOW_STALE] = !!allowStale
  }
  get allowStale () {
    return this[ALLOW_STALE]
  }

  set maxAge (mA) {
    if (typeof mA !== 'number')
      throw new TypeError('maxAge must be a non-negative number')

    this[MAX_AGE] = mA
    trim(this)
  }
  get maxAge () {
    return this[MAX_AGE]
  }

  // resize the cache when the lengthCalculator changes.
  set lengthCalculator (lC) {
    if (typeof lC !== 'function')
      lC = naiveLength

    if (lC !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = lC
      this[LENGTH] = 0
      this[LRU_LIST].forEach(hit => {
        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key)
        this[LENGTH] += hit.length
      })
    }
    trim(this)
  }
  get lengthCalculator () { return this[LENGTH_CALCULATOR] }

  get length () { return this[LENGTH] }
  get itemCount () { return this[LRU_LIST].length }

  rforEach (fn, thisp) {
    thisp = thisp || this
    for (let walker = this[LRU_LIST].tail; walker !== null;) {
      const prev = walker.prev
      forEachStep(this, fn, walker, thisp)
      walker = prev
    }
  }

  forEach (fn, thisp) {
    thisp = thisp || this
    for (let walker = this[LRU_LIST].head; walker !== null;) {
      const next = walker.next
      forEachStep(this, fn, walker, thisp)
      walker = next
    }
  }

  keys () {
    return this[LRU_LIST].toArray().map(k => k.key)
  }

  values () {
    return this[LRU_LIST].toArray().map(k => k.value)
  }

  reset () {
    if (this[DISPOSE] &&
        this[LRU_LIST] &&
        this[LRU_LIST].length) {
      this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value))
    }

    this[CACHE] = new Map() // hash of items by key
    this[LRU_LIST] = new Yallist() // list of items in order of use recency
    this[LENGTH] = 0 // length of items in the list
  }

  dump () {
    return this[LRU_LIST].map(hit =>
      isStale(this, hit) ? false : {
        k: hit.key,
        v: hit.value,
        e: hit.now + (hit.maxAge || 0)
      }).toArray().filter(h => h)
  }

  dumpLru () {
    return this[LRU_LIST]
  }

  set (key, value, maxAge) {
    maxAge = maxAge || this[MAX_AGE]

    if (maxAge && typeof maxAge !== 'number')
      throw new TypeError('maxAge must be a number')

    const now = maxAge ? Date.now() : 0
    const len = this[LENGTH_CALCULATOR](value, key)

    if (this[CACHE].has(key)) {
      if (len > this[MAX]) {
        del(this, this[CACHE].get(key))
        return false
      }

      const node = this[CACHE].get(key)
      const item = node.value

      // dispose of the old one before overwriting
      // split out into 2 ifs for better coverage tracking
      if (this[DISPOSE]) {
        if (!this[NO_DISPOSE_ON_SET])
          this[DISPOSE](key, item.value)
      }

      item.now = now
      item.maxAge = maxAge
      item.value = value
      this[LENGTH] += len - item.length
      item.length = len
      this.get(key)
      trim(this)
      return true
    }

    const hit = new Entry(key, value, len, now, maxAge)

    // oversized objects fall out of cache automatically.
    if (hit.length > this[MAX]) {
      if (this[DISPOSE])
        this[DISPOSE](key, value)

      return false
    }

    this[LENGTH] += hit.length
    this[LRU_LIST].unshift(hit)
    this[CACHE].set(key, this[LRU_LIST].head)
    trim(this)
    return true
  }

  has (key) {
    if (!this[CACHE].has(key)) return false
    const hit = this[CACHE].get(key).value
    return !isStale(this, hit)
  }

  get (key) {
    return get(this, key, true)
  }

  peek (key) {
    return get(this, key, false)
  }

  pop () {
    const node = this[LRU_LIST].tail
    if (!node)
      return null

    del(this, node)
    return node.value
  }

  del (key) {
    del(this, this[CACHE].get(key))
  }

  load (arr) {
    // reset the cache
    this.reset()

    const now = Date.now()
    // A previous serialized cache has the most recent items first
    for (let l = arr.length - 1; l >= 0; l--) {
      const hit = arr[l]
      const expiresAt = hit.e || 0
      if (expiresAt === 0)
        // the item was created without expiration in a non aged cache
        this.set(hit.k, hit.v)
      else {
        const maxAge = expiresAt - now
        // dont add already expired items
        if (maxAge > 0) {
          this.set(hit.k, hit.v, maxAge)
        }
      }
    }
  }

  prune () {
    this[CACHE].forEach((value, key) => get(this, key, false))
  }
}

const get = (self, key, doUse) => {
  const node = self[CACHE].get(key)
  if (node) {
    const hit = node.value
    if (isStale(self, hit)) {
      del(self, node)
      if (!self[ALLOW_STALE])
        return undefined
    } else {
      if (doUse) {
        if (self[UPDATE_AGE_ON_GET])
          node.value.now = Date.now()
        self[LRU_LIST].unshiftNode(node)
      }
    }
    return hit.value
  }
}

const isStale = (self, hit) => {
  if (!hit || (!hit.maxAge && !self[MAX_AGE]))
    return false

  const diff = Date.now() - hit.now
  return hit.maxAge ? diff > hit.maxAge
    : self[MAX_AGE] && (diff > self[MAX_AGE])
}

const trim = self => {
  if (self[LENGTH] > self[MAX]) {
    for (let walker = self[LRU_LIST].tail;
      self[LENGTH] > self[MAX] && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      const prev = walker.prev
      del(self, walker)
      walker = prev
    }
  }
}

const del = (self, node) => {
  if (node) {
    const hit = node.value
    if (self[DISPOSE])
      self[DISPOSE](hit.key, hit.value)

    self[LENGTH] -= hit.length
    self[CACHE].delete(hit.key)
    self[LRU_LIST].removeNode(node)
  }
}

class Entry {
  constructor (key, value, length, now, maxAge) {
    this.key = key
    this.value = value
    this.length = length
    this.now = now
    this.maxAge = maxAge || 0
  }
}

const forEachStep = (self, fn, node, thisp) => {
  let hit = node.value
  if (isStale(self, hit)) {
    del(self, node)
    if (!self[ALLOW_STALE])
      hit = undefined
  }
  if (hit)
    fn.call(thisp, hit.value, hit.key, self)
}

module.exports = LRUCache


/***/ }),

/***/ "../../node_modules/path-browserify/index.js":
/*!***************************************************!*\
  !*** ../../node_modules/path-browserify/index.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process/browser */ "../../node_modules/process/browser.js");
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;


/***/ }),

/***/ "../../node_modules/process/browser.js":
/*!*********************************************!*\
  !*** ../../node_modules/process/browser.js ***!
  \*********************************************/
/***/ ((module) => {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "../../node_modules/querystring/decode.js":
/*!************************************************!*\
  !*** ../../node_modules/querystring/decode.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};


/***/ }),

/***/ "../../node_modules/querystring/encode.js":
/*!************************************************!*\
  !*** ../../node_modules/querystring/encode.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).map(function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (Array.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};


/***/ }),

/***/ "../../node_modules/querystring/index.js":
/*!***********************************************!*\
  !*** ../../node_modules/querystring/index.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.decode = exports.parse = __webpack_require__(/*! ./decode */ "../../node_modules/querystring/decode.js");
exports.encode = exports.stringify = __webpack_require__(/*! ./encode */ "../../node_modules/querystring/encode.js");


/***/ }),

/***/ "../paperclip-designer/src/actions/base.ts":
/*!*************************************************!*\
  !*** ../paperclip-designer/src/actions/base.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "actionCreator": () => /* binding */ actionCreator
/* harmony export */ });
var actionCreator = function (type) { return function (payload) { return ({
    type: type,
    payload: payload
}); }; };


/***/ }),

/***/ "../paperclip-designer/src/actions/external-actions.ts":
/*!*************************************************************!*\
  !*** ../paperclip-designer/src/actions/external-actions.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ExternalActionType": () => /* binding */ ExternalActionType,
/* harmony export */   "contentChanged": () => /* binding */ contentChanged,
/* harmony export */   "openedDocument": () => /* binding */ openedDocument,
/* harmony export */   "configChanged": () => /* binding */ configChanged
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "../paperclip-designer/src/actions/base.ts");

var ExternalActionType;
(function (ExternalActionType) {
    ExternalActionType["OPENED_DOCUMENT"] = "OPENED_DOCUMENT";
    ExternalActionType["CONTENT_CHANGED"] = "CONTENT_CHANGED";
    ExternalActionType["CONFIG_CHANGED"] = "CONFIG_CHANGED";
})(ExternalActionType || (ExternalActionType = {}));
var contentChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ExternalActionType.CONTENT_CHANGED);
var openedDocument = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ExternalActionType.OPENED_DOCUMENT);
var configChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ExternalActionType.CONFIG_CHANGED);


/***/ }),

/***/ "../paperclip-designer/src/actions/index.ts":
/*!**************************************************!*\
  !*** ../paperclip-designer/src/actions/index.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ActionType": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.ActionType,
/* harmony export */   "birdseyeFilterChanged": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.birdseyeFilterChanged,
/* harmony export */   "birdseyeTopFilterBlurred": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.birdseyeTopFilterBlurred,
/* harmony export */   "canvasMouseLeave": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasMouseLeave,
/* harmony export */   "canvasMouseMoved": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasMouseMoved,
/* harmony export */   "canvasMouseUp": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasMouseUp,
/* harmony export */   "canvasPanEnd": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasPanEnd,
/* harmony export */   "canvasPanStart": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasPanStart,
/* harmony export */   "canvasPanned": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasPanned,
/* harmony export */   "canvasResized": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasResized,
/* harmony export */   "clientConnected": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.clientConnected,
/* harmony export */   "collapseFrameButtonClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.collapseFrameButtonClicked,
/* harmony export */   "dirLoaded": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.dirLoaded,
/* harmony export */   "engineDelegateChanged": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.engineDelegateChanged,
/* harmony export */   "engineDelegateEventsHandled": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.engineDelegateEventsHandled,
/* harmony export */   "engineErrored": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.engineErrored,
/* harmony export */   "envOptionClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.envOptionClicked,
/* harmony export */   "errorBannerClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.errorBannerClicked,
/* harmony export */   "expandFrameButtonClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.expandFrameButtonClicked,
/* harmony export */   "fileOpened": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.fileOpened,
/* harmony export */   "frameTitleChanged": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.frameTitleChanged,
/* harmony export */   "frameTitleClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.frameTitleClicked,
/* harmony export */   "fsItemClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.fsItemClicked,
/* harmony export */   "getAllScreensRequested": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.getAllScreensRequested,
/* harmony export */   "globalBackspaceKeyPressed": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalBackspaceKeyPressed,
/* harmony export */   "globalBackspaceKeySent": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalBackspaceKeySent,
/* harmony export */   "globalEscapeKeyPressed": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalEscapeKeyPressed,
/* harmony export */   "globalHKeyDown": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalHKeyDown,
/* harmony export */   "globalMetaKeyDown": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalMetaKeyDown,
/* harmony export */   "globalMetaKeyUp": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalMetaKeyUp,
/* harmony export */   "globalOptionKeyDown": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalOptionKeyDown,
/* harmony export */   "globalOptionKeyUp": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalOptionKeyUp,
/* harmony export */   "globalSaveKeyPress": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalSaveKeyPress,
/* harmony export */   "globalYKeyDown": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalYKeyDown,
/* harmony export */   "globalZKeyDown": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalZKeyDown,
/* harmony export */   "gridButtonClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.gridButtonClicked,
/* harmony export */   "gridHotkeyPressed": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.gridHotkeyPressed,
/* harmony export */   "locationChanged": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.locationChanged,
/* harmony export */   "metaClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.metaClicked,
/* harmony export */   "pasted": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.pasted,
/* harmony export */   "pcFileLoaded": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.pcFileLoaded,
/* harmony export */   "pcVirtObjectEdited": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.pcVirtObjectEdited,
/* harmony export */   "popoutButtonClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.popoutButtonClicked,
/* harmony export */   "popoutWindowRequested": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.popoutWindowRequested,
/* harmony export */   "rectsCaptured": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.rectsCaptured,
/* harmony export */   "redirectRequest": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.redirectRequest,
/* harmony export */   "rendererChanged": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.rendererChanged,
/* harmony export */   "rendererMounted": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.rendererMounted,
/* harmony export */   "rendererUnounted": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.rendererUnounted,
/* harmony export */   "resizerMoved": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.resizerMoved,
/* harmony export */   "resizerPathMoved": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.resizerPathMoved,
/* harmony export */   "resizerPathStoppedMoving": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.resizerPathStoppedMoving,
/* harmony export */   "resizerStoppedMoving": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.resizerStoppedMoving,
/* harmony export */   "titleDoubleClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.titleDoubleClicked,
/* harmony export */   "zoomInButtonClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.zoomInButtonClicked,
/* harmony export */   "zoomInKeyPressed": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.zoomInKeyPressed,
/* harmony export */   "zoomInputChanged": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.zoomInputChanged,
/* harmony export */   "zoomOutButtonClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.zoomOutButtonClicked,
/* harmony export */   "zoomOutKeyPressed": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.zoomOutKeyPressed,
/* harmony export */   "ServerActionType": () => /* reexport safe */ _server_actions__WEBPACK_IMPORTED_MODULE_1__.ServerActionType,
/* harmony export */   "allPCContentLoaded": () => /* reexport safe */ _server_actions__WEBPACK_IMPORTED_MODULE_1__.allPCContentLoaded,
/* harmony export */   "browserstackBrowsersLoaded": () => /* reexport safe */ _server_actions__WEBPACK_IMPORTED_MODULE_1__.browserstackBrowsersLoaded,
/* harmony export */   "crashed": () => /* reexport safe */ _server_actions__WEBPACK_IMPORTED_MODULE_1__.crashed,
/* harmony export */   "initParamsDefined": () => /* reexport safe */ _server_actions__WEBPACK_IMPORTED_MODULE_1__.initParamsDefined,
/* harmony export */   "instanceChanged": () => /* reexport safe */ _server_actions__WEBPACK_IMPORTED_MODULE_1__.instanceChanged,
/* harmony export */   "ExternalActionType": () => /* reexport safe */ _external_actions__WEBPACK_IMPORTED_MODULE_2__.ExternalActionType,
/* harmony export */   "configChanged": () => /* reexport safe */ _external_actions__WEBPACK_IMPORTED_MODULE_2__.configChanged,
/* harmony export */   "contentChanged": () => /* reexport safe */ _external_actions__WEBPACK_IMPORTED_MODULE_2__.contentChanged,
/* harmony export */   "openedDocument": () => /* reexport safe */ _external_actions__WEBPACK_IMPORTED_MODULE_2__.openedDocument
/* harmony export */ });
/* harmony import */ var _instance_actions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./instance-actions */ "../paperclip-designer/src/actions/instance-actions.ts");
/* harmony import */ var _server_actions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./server-actions */ "../paperclip-designer/src/actions/server-actions.ts");
/* harmony import */ var _external_actions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./external-actions */ "../paperclip-designer/src/actions/external-actions.ts");





/***/ }),

/***/ "../paperclip-designer/src/actions/instance-actions.ts":
/*!*************************************************************!*\
  !*** ../paperclip-designer/src/actions/instance-actions.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ActionType": () => /* binding */ ActionType,
/* harmony export */   "pcVirtObjectEdited": () => /* binding */ pcVirtObjectEdited,
/* harmony export */   "engineDelegateChanged": () => /* binding */ engineDelegateChanged,
/* harmony export */   "gridButtonClicked": () => /* binding */ gridButtonClicked,
/* harmony export */   "frameTitleClicked": () => /* binding */ frameTitleClicked,
/* harmony export */   "frameTitleChanged": () => /* binding */ frameTitleChanged,
/* harmony export */   "titleDoubleClicked": () => /* binding */ titleDoubleClicked,
/* harmony export */   "rendererMounted": () => /* binding */ rendererMounted,
/* harmony export */   "rendererUnounted": () => /* binding */ rendererUnounted,
/* harmony export */   "birdseyeFilterChanged": () => /* binding */ birdseyeFilterChanged,
/* harmony export */   "redirectRequest": () => /* binding */ redirectRequest,
/* harmony export */   "engineDelegateEventsHandled": () => /* binding */ engineDelegateEventsHandled,
/* harmony export */   "fileOpened": () => /* binding */ fileOpened,
/* harmony export */   "errorBannerClicked": () => /* binding */ errorBannerClicked,
/* harmony export */   "pcFileLoaded": () => /* binding */ pcFileLoaded,
/* harmony export */   "expandFrameButtonClicked": () => /* binding */ expandFrameButtonClicked,
/* harmony export */   "collapseFrameButtonClicked": () => /* binding */ collapseFrameButtonClicked,
/* harmony export */   "resizerPathMoved": () => /* binding */ resizerPathMoved,
/* harmony export */   "locationChanged": () => /* binding */ locationChanged,
/* harmony export */   "envOptionClicked": () => /* binding */ envOptionClicked,
/* harmony export */   "metaClicked": () => /* binding */ metaClicked,
/* harmony export */   "resizerPathStoppedMoving": () => /* binding */ resizerPathStoppedMoving,
/* harmony export */   "birdseyeTopFilterBlurred": () => /* binding */ birdseyeTopFilterBlurred,
/* harmony export */   "resizerMoved": () => /* binding */ resizerMoved,
/* harmony export */   "resizerStoppedMoving": () => /* binding */ resizerStoppedMoving,
/* harmony export */   "rectsCaptured": () => /* binding */ rectsCaptured,
/* harmony export */   "canvasMouseUp": () => /* binding */ canvasMouseUp,
/* harmony export */   "canvasMouseLeave": () => /* binding */ canvasMouseLeave,
/* harmony export */   "canvasPanned": () => /* binding */ canvasPanned,
/* harmony export */   "canvasPanStart": () => /* binding */ canvasPanStart,
/* harmony export */   "canvasPanEnd": () => /* binding */ canvasPanEnd,
/* harmony export */   "canvasResized": () => /* binding */ canvasResized,
/* harmony export */   "canvasMouseMoved": () => /* binding */ canvasMouseMoved,
/* harmony export */   "rendererChanged": () => /* binding */ rendererChanged,
/* harmony export */   "engineErrored": () => /* binding */ engineErrored,
/* harmony export */   "zoomInButtonClicked": () => /* binding */ zoomInButtonClicked,
/* harmony export */   "zoomOutButtonClicked": () => /* binding */ zoomOutButtonClicked,
/* harmony export */   "zoomInputChanged": () => /* binding */ zoomInputChanged,
/* harmony export */   "popoutWindowRequested": () => /* binding */ popoutWindowRequested,
/* harmony export */   "globalEscapeKeyPressed": () => /* binding */ globalEscapeKeyPressed,
/* harmony export */   "globalBackspaceKeyPressed": () => /* binding */ globalBackspaceKeyPressed,
/* harmony export */   "globalBackspaceKeySent": () => /* binding */ globalBackspaceKeySent,
/* harmony export */   "globalMetaKeyDown": () => /* binding */ globalMetaKeyDown,
/* harmony export */   "globalOptionKeyDown": () => /* binding */ globalOptionKeyDown,
/* harmony export */   "globalZKeyDown": () => /* binding */ globalZKeyDown,
/* harmony export */   "popoutButtonClicked": () => /* binding */ popoutButtonClicked,
/* harmony export */   "clientConnected": () => /* binding */ clientConnected,
/* harmony export */   "globalYKeyDown": () => /* binding */ globalYKeyDown,
/* harmony export */   "globalHKeyDown": () => /* binding */ globalHKeyDown,
/* harmony export */   "globalSaveKeyPress": () => /* binding */ globalSaveKeyPress,
/* harmony export */   "globalMetaKeyUp": () => /* binding */ globalMetaKeyUp,
/* harmony export */   "globalOptionKeyUp": () => /* binding */ globalOptionKeyUp,
/* harmony export */   "dirLoaded": () => /* binding */ dirLoaded,
/* harmony export */   "fsItemClicked": () => /* binding */ fsItemClicked,
/* harmony export */   "pasted": () => /* binding */ pasted,
/* harmony export */   "gridHotkeyPressed": () => /* binding */ gridHotkeyPressed,
/* harmony export */   "getAllScreensRequested": () => /* binding */ getAllScreensRequested,
/* harmony export */   "zoomInKeyPressed": () => /* binding */ zoomInKeyPressed,
/* harmony export */   "zoomOutKeyPressed": () => /* binding */ zoomOutKeyPressed
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "../paperclip-designer/src/actions/base.ts");

var ActionType;
(function (ActionType) {
    ActionType["RENDERER_CHANGED"] = "RENDERER_CHANGED";
    ActionType["LOCATION_CHANGED"] = "LOCATION_CHANGED";
    ActionType["RENDERER_MOUNTED"] = "RENDERER_MOUNTED";
    ActionType["REDIRECT_REQUESTED"] = "REDIRECT_REQUESTED";
    ActionType["ZOOM_IN_KEY_PRESSED"] = "ZOOM_IN_KEY_PRESSED";
    ActionType["ZOOM_OUT_KEY_PRESSED"] = "ZOOM_OUT_KEY_PRESSED";
    ActionType["BIRDSEYE_FILTER_CHANGED"] = "BIRDSEYE_FILTER_CHANGED";
    ActionType["ENV_OPTION_CLICKED"] = "ENV_OPTION_CLICKED";
    ActionType["BIRDSEYE_TOP_FILTER_BLURRED"] = "BIRDSEYE_TOP_FILTER_BLURRED";
    ActionType["RENDERER_UNMOUNTED"] = "RENDERER_UNMOUNTED";
    ActionType["PC_FILE_OPENED"] = "PC_FILE_OPENED";
    ActionType["GRID_BUTTON_CLICKED"] = "GRID_BUTTON_CLICKED";
    ActionType["CLIENT_CONNECTED"] = "CLIENT_CONNECTED";
    ActionType["ENGINE_ERRORED"] = "ENGINE_ERRORED";
    ActionType["ERROR_BANNER_CLICKED"] = "ERROR_BANNER_CLICKED";
    ActionType["CANVAS_MOUSE_LEAVE"] = "CANVAS_MOUSE_LEAVE";
    ActionType["CANVAS_MOUSE_UP"] = "CANVAS_MOUSE_UP";
    ActionType["ZOOM_IN_BUTTON_CLICKED"] = "ZOOM_IN_BUTTON_CLICKED";
    ActionType["POPOUT_BUTTON_CLICKED"] = "POPOUT_BUTTON_CLICKED";
    ActionType["POPOUT_WINDOW_REQUESTED"] = "POPOUT_WINDOW_REQUESTED";
    ActionType["PASTED"] = "PASTED";
    ActionType["ZOOM_OUT_BUTTON_CLICKED"] = "ZOOM_OUT_BUTTON_CLICKED";
    ActionType["ZOOM_INPUT_CHANGED"] = "ZOOM_INPUT_CHANGED";
    ActionType["CANVAS_RESIZED"] = "CANVAS_RESIZED";
    ActionType["CANVAS_MOUSE_MOVED"] = "CANVAS_MOUSE_MOVED";
    ActionType["TITLE_DOUBLE_CLICKED"] = "TITLE_DOUBLE_CLICKED";
    ActionType["DIR_LOADED"] = "DIR_LOADED";
    ActionType["FS_ITEM_CLICKED"] = "FS_ITEM_CLICKED";
    ActionType["CANVAS_PAN_START"] = "CANVAS_PAN_START";
    ActionType["CANVAS_PAN_END"] = "CANVAS_PAN_END";
    ActionType["CANVAS_PANNED"] = "CANVAS_PANNED";
    ActionType["RECTS_CAPTURED"] = "RECTS_CAPTURED";
    ActionType["GLOBAL_ESCAPE_KEY_PRESSED"] = "GLOBAL_ESCAPE_KEY_PRESSED";
    ActionType["GLOBAL_META_KEY_DOWN"] = "GLOBAL_META_KEY_DOWN";
    ActionType["GLOBAL_OPTION_KEY_DOWN"] = "GLOBAL_OPTION_KEY_DOWN";
    ActionType["GLOBAL_Z_KEY_DOWN"] = "GLOBAL_Z_KEY_DOWN";
    ActionType["GLOBAL_Y_KEY_DOWN"] = "GLOBAL_Y_KEY_DOWN";
    ActionType["GLOBAL_H_KEY_DOWN"] = "GLOBAL_H_KEY_DOWN";
    ActionType["GRID_HOTKEY_PRESSED"] = "GRID_HOTKEY_PRESSED";
    ActionType["GET_ALL_SCREENS_REQUESTED"] = "GET_ALL_SCREENS_REQUESTED";
    ActionType["GLOBAL_SAVE_KEY_DOWN"] = "GLOBAL_SAVE_KEY_DOWN";
    ActionType["GLOBAL_BACKSPACE_KEY_PRESSED"] = "GLOBAL_BACKSPACE_KEY_PRESSED";
    ActionType["GLOBAL_BACKSPACE_KEY_SENT"] = "GLOBAL_BACKSPACE_KEY_SENT";
    ActionType["GLOBAL_META_KEY_UP"] = "GLOBAL_META_KEY_UP";
    ActionType["GLOBAL_OPTION_KEY_UP"] = "GLOBAL_OPTION_KEY_UP";
    ActionType["ENGINE_DELEGATE_CHANGED"] = "ENGINE_DELEGATE_CHANGED";
    ActionType["ENGINE_DELEGATE_EVENTS_HANDLED"] = "ENGINE_DELEGATE_EVENTS_HANDLED";
    ActionType["FRAME_TITLE_CLICKED"] = "FRAME_TITLE_CLICKED";
    ActionType["FILE_OPENED"] = "FILE_OPENED";
    ActionType["RESIZER_PATH_MOUSE_MOVED"] = "RESIZER_PATH_MOUSE_MOVED";
    ActionType["RESIZER_MOVED"] = "RESIZER_MOVED";
    ActionType["RESIZER_STOPPED_MOVING"] = "RESIZER_STOPPED_MOVING";
    ActionType["RESIZER_PATH_MOUSE_STOPPED_MOVING"] = "RESIZER_PATH_MOUSE_STOPPED_MOVING";
    ActionType["META_CLICKED"] = "META_CLICKED";
    ActionType["PC_VIRT_OBJECT_EDITED"] = "PC_VIRT_OBJECT_EDITED";
    ActionType["FRAME_TITLE_CHANGED"] = "FRAME_TITLE_CHANGED";
    ActionType["EXPAND_FRAME_BUTTON_CLICKED"] = "EXPAND_FRAME_BUTTON_CLICKED";
    ActionType["COLLAPSE_FRAME_BUTTON_CLICKED"] = "COLLAPSE_FRAME_BUTTON_CLICKED";
    ActionType["VISUAL_EDITOR_INSTANCE_CHANGED"] = "VISUAL_EDITOR_INSTANCE_CHANGED";
})(ActionType || (ActionType = {}));
var pcVirtObjectEdited = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.PC_VIRT_OBJECT_EDITED);
var engineDelegateChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ENGINE_DELEGATE_CHANGED);
var gridButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GRID_BUTTON_CLICKED);
var frameTitleClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.FRAME_TITLE_CLICKED);
var frameTitleChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.FRAME_TITLE_CHANGED);
var titleDoubleClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.TITLE_DOUBLE_CLICKED);
var rendererMounted = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RENDERER_MOUNTED);
var rendererUnounted = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RENDERER_UNMOUNTED);
var birdseyeFilterChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.BIRDSEYE_FILTER_CHANGED);
var redirectRequest = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.REDIRECT_REQUESTED);
var engineDelegateEventsHandled = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ENGINE_DELEGATE_EVENTS_HANDLED);
var fileOpened = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.FILE_OPENED);
var errorBannerClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ERROR_BANNER_CLICKED);
var pcFileLoaded = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.PC_FILE_OPENED);
var expandFrameButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.EXPAND_FRAME_BUTTON_CLICKED);
var collapseFrameButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.COLLAPSE_FRAME_BUTTON_CLICKED);
var resizerPathMoved = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RESIZER_PATH_MOUSE_MOVED);
var locationChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.LOCATION_CHANGED);
var envOptionClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ENV_OPTION_CLICKED);
var metaClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.META_CLICKED);
var resizerPathStoppedMoving = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING);
var birdseyeTopFilterBlurred = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.BIRDSEYE_TOP_FILTER_BLURRED);
var resizerMoved = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RESIZER_MOVED);
var resizerStoppedMoving = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RESIZER_STOPPED_MOVING);
var rectsCaptured = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RECTS_CAPTURED);
var canvasMouseUp = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_MOUSE_UP);
var canvasMouseLeave = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_MOUSE_LEAVE);
var canvasPanned = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_PANNED);
var canvasPanStart = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_PAN_START);
var canvasPanEnd = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_PAN_END);
var canvasResized = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_RESIZED);
var canvasMouseMoved = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_MOUSE_MOVED);
var rendererChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RENDERER_CHANGED);
var engineErrored = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ENGINE_ERRORED);
var zoomInButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ZOOM_IN_BUTTON_CLICKED);
var zoomOutButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ZOOM_OUT_BUTTON_CLICKED);
var zoomInputChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ZOOM_INPUT_CHANGED);
var popoutWindowRequested = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.POPOUT_WINDOW_REQUESTED);
var globalEscapeKeyPressed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_ESCAPE_KEY_PRESSED);
var globalBackspaceKeyPressed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_BACKSPACE_KEY_PRESSED);
var globalBackspaceKeySent = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_BACKSPACE_KEY_SENT);
var globalMetaKeyDown = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_META_KEY_DOWN);
var globalOptionKeyDown = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_OPTION_KEY_DOWN);
var globalZKeyDown = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_Z_KEY_DOWN);
var popoutButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.POPOUT_BUTTON_CLICKED);
var clientConnected = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CLIENT_CONNECTED);
var globalYKeyDown = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_Y_KEY_DOWN);
var globalHKeyDown = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_H_KEY_DOWN);
var globalSaveKeyPress = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_SAVE_KEY_DOWN);
var globalMetaKeyUp = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_META_KEY_UP);
var globalOptionKeyUp = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_OPTION_KEY_UP);
var dirLoaded = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.DIR_LOADED);
var fsItemClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.FS_ITEM_CLICKED);
var pasted = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.PASTED);
var gridHotkeyPressed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GRID_HOTKEY_PRESSED);
var getAllScreensRequested = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GET_ALL_SCREENS_REQUESTED);
var zoomInKeyPressed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ZOOM_IN_KEY_PRESSED);
var zoomOutKeyPressed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ZOOM_OUT_KEY_PRESSED);


/***/ }),

/***/ "../paperclip-designer/src/actions/server-actions.ts":
/*!***********************************************************!*\
  !*** ../paperclip-designer/src/actions/server-actions.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ServerActionType": () => /* binding */ ServerActionType,
/* harmony export */   "instanceChanged": () => /* binding */ instanceChanged,
/* harmony export */   "initParamsDefined": () => /* binding */ initParamsDefined,
/* harmony export */   "crashed": () => /* binding */ crashed,
/* harmony export */   "allPCContentLoaded": () => /* binding */ allPCContentLoaded,
/* harmony export */   "browserstackBrowsersLoaded": () => /* binding */ browserstackBrowsersLoaded
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "../paperclip-designer/src/actions/base.ts");

var ServerActionType;
(function (ServerActionType) {
    ServerActionType["INSTANCE_CHANGED"] = "INSTANCE_CHANGED";
    ServerActionType["CRASHED"] = "CRASHED";
    ServerActionType["ALL_PC_CONTENT_LOADED"] = "ALL_PC_CONTENT_LOADED";
    ServerActionType["INIT_PARAM_DEFINED"] = "INIT_PARAM_DEFINED";
    ServerActionType["BROWSERSTACK_BROWSERS_LOADED"] = "INIT_PARAM_BROWSERSTACK_BROWSERS_LOADEDDEFINED";
})(ServerActionType || (ServerActionType = {}));
var instanceChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ServerActionType.INSTANCE_CHANGED);
var initParamsDefined = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ServerActionType.INIT_PARAM_DEFINED);
var crashed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ServerActionType.CRASHED);
var allPCContentLoaded = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ServerActionType.ALL_PC_CONTENT_LOADED);
var browserstackBrowsersLoaded = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ServerActionType.BROWSERSTACK_BROWSERS_LOADED);


/***/ }),

/***/ "./src/frontend/actions/base.ts":
/*!**************************************!*\
  !*** ./src/frontend/actions/base.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "actionCreator": () => /* binding */ actionCreator
/* harmony export */ });
var actionCreator = function (type) { return function (payload) { return ({
    type: type,
    payload: payload
}); }; };


/***/ }),

/***/ "./src/frontend/actions/index.ts":
/*!***************************************!*\
  !*** ./src/frontend/actions/index.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ActionType": () => /* binding */ ActionType,
/* harmony export */   "AccountKind": () => /* binding */ AccountKind,
/* harmony export */   "newProjectEntered": () => /* binding */ newProjectEntered,
/* harmony export */   "rawFileUploaded": () => /* binding */ rawFileUploaded,
/* harmony export */   "filesDropped": () => /* binding */ filesDropped,
/* harmony export */   "downloadProjectClicked": () => /* binding */ downloadProjectClicked,
/* harmony export */   "accountConnected": () => /* binding */ accountConnected,
/* harmony export */   "logoutButtonClicked": () => /* binding */ logoutButtonClicked,
/* harmony export */   "removeFileClicked": () => /* binding */ removeFileClicked,
/* harmony export */   "fileRenamed": () => /* binding */ fileRenamed,
/* harmony export */   "sessionLoaded": () => /* binding */ sessionLoaded,
/* harmony export */   "savedProject": () => /* binding */ savedProject,
/* harmony export */   "loggedOut": () => /* binding */ loggedOut,
/* harmony export */   "engineLoaded": () => /* binding */ engineLoaded,
/* harmony export */   "engineCrashed": () => /* binding */ engineCrashed,
/* harmony export */   "saveButtonClicked": () => /* binding */ saveButtonClicked,
/* harmony export */   "codeEditorChanged": () => /* binding */ codeEditorChanged,
/* harmony export */   "slimCodeEditorChanged": () => /* binding */ slimCodeEditorChanged,
/* harmony export */   "workerInitialized": () => /* binding */ workerInitialized,
/* harmony export */   "appStateDiffed": () => /* binding */ appStateDiffed,
/* harmony export */   "contentChangesCreated": () => /* binding */ contentChangesCreated,
/* harmony export */   "newFileNameEntered": () => /* binding */ newFileNameEntered,
/* harmony export */   "projectRenamed": () => /* binding */ projectRenamed,
/* harmony export */   "fileItemClicked": () => /* binding */ fileItemClicked,
/* harmony export */   "deleteProjectConfirmed": () => /* binding */ deleteProjectConfirmed,
/* harmony export */   "syncPanelsClicked": () => /* binding */ syncPanelsClicked,
/* harmony export */   "getProjectRequestChanged": () => /* binding */ getProjectRequestChanged,
/* harmony export */   "getProjectsRequestChanged": () => /* binding */ getProjectsRequestChanged,
/* harmony export */   "getProjectFilesRequestChanged": () => /* binding */ getProjectFilesRequestChanged,
/* harmony export */   "projectHookUsed": () => /* binding */ projectHookUsed,
/* harmony export */   "projectFilesHookUsed": () => /* binding */ projectFilesHookUsed,
/* harmony export */   "allProjectsHookUsed": () => /* binding */ allProjectsHookUsed
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/frontend/actions/base.ts");

var ActionType;
(function (ActionType) {
    ActionType["PROJECT_HOOK_USED"] = "PROJECT_HOOK_USED";
    ActionType["ALL_PROJECTS_HOOK_USED"] = "ALL_PROJECTS_HOOK_USED";
    ActionType["PROJECT_FILES_HOOK_USED"] = "PROJECT_FILES_HOOK_USED";
    ActionType["DELETE_PROJECT_CONFIRMED"] = "DELETE_PROJECT_CONFIRMED";
    ActionType["DOWNLOAD_PROJECT_CLICKED"] = "DOWNLOAD_PROJECT_CLICKED";
    ActionType["RAW_FILE_UPLOADED"] = "RAW_FILE_UPLOADED";
    ActionType["FILES_DROPPED"] = "FILES_DROPPED";
    ActionType["NEW_PROJECT_ENTERED"] = "NEW_PROJECT_ENTERED";
    ActionType["REMOVE_FILE_CLICKED"] = "REMOVE_FILE_CLICKED";
    ActionType["FILE_RENAMED"] = "FILE_RENAMED";
    ActionType["PROJECT_RENAMED"] = "PROJECT_RENAMED";
    ActionType["REQUEST_CHANGED"] = "REQUEST_CHANGED";
    ActionType["ENGINE_LOADED"] = "ENGINE_LOADED";
    ActionType["GET_PROJECTS_REQUEST_CHANGED"] = "GET_PROJECTS_REQUEST_CHANGED";
    ActionType["GET_PROJECT_REQUEST_CHANGED"] = "GET_PROJECT_REQUEST_CHANGED";
    ActionType["GET_PROJECT_FILES_REQUEST_CHANGED"] = "GET_PROJECT_FILES_REQUEST_CHANGED";
    ActionType["LOGOUT_BUTTON_CLICKED"] = "LOGOUT_BUTTON_CLICKED";
    ActionType["ENGINE_CRASHED"] = "ENGINE_CRASHED";
    ActionType["SAVED_PROJECT"] = "SAVED_PROJECT";
    ActionType["SAVE_BUTTON_CLICKED"] = "SAVE_BUTTON_CLICKED";
    ActionType["LOGGED_OUT"] = "LOGGED_OUT";
    ActionType["SESSION_LOADED"] = "SESSION_LOADED";
    ActionType["CODE_EDITOR_TEXT_CHANGED"] = "CODE_EDITOR_TEXT_CHANGED";
    ActionType["SLIM_CODE_EDITOR_TEXT_CHANGED"] = "SLIM_CODE_EDITOR_TEXT_CHANGED";
    ActionType["WORKER_INITIALIZED"] = "WORKER_INITIALIZED";
    ActionType["APP_STATE_DIFFED"] = "APP_STATE_DIFFED";
    ActionType["CONTENT_CHANGES_CREATED"] = "CONTENT_CHANGES_CREATED";
    ActionType["FILE_ITEM_CLICKED"] = "FILE_ITEM_CLICKED";
    ActionType["NEW_FILE_NAME_ENTERED"] = "NEW_FILE_NAME_ENTERED";
    ActionType["SYNC_PANELS_CLICKED"] = "SYNC_PANELS_CLICKED";
    ActionType["ACCOUNT_CONNECTED"] = "ACCOUNT_CONNECTED";
})(ActionType || (ActionType = {}));
var AccountKind;
(function (AccountKind) {
    AccountKind["Google"] = "google";
    AccountKind["GitHub"] = "github";
})(AccountKind || (AccountKind = {}));
var newProjectEntered = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.NEW_PROJECT_ENTERED);
var rawFileUploaded = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RAW_FILE_UPLOADED);
var filesDropped = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.FILES_DROPPED);
var downloadProjectClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.DOWNLOAD_PROJECT_CLICKED);
var accountConnected = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ACCOUNT_CONNECTED);
var logoutButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.LOGOUT_BUTTON_CLICKED);
var removeFileClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.REMOVE_FILE_CLICKED);
var fileRenamed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.FILE_RENAMED);
var sessionLoaded = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.SESSION_LOADED);
var savedProject = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.SAVED_PROJECT);
var loggedOut = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.LOGGED_OUT);
var engineLoaded = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ENGINE_LOADED);
var engineCrashed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ENGINE_CRASHED);
var saveButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.SAVE_BUTTON_CLICKED);
var codeEditorChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CODE_EDITOR_TEXT_CHANGED);
var slimCodeEditorChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.SLIM_CODE_EDITOR_TEXT_CHANGED);
var workerInitialized = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.WORKER_INITIALIZED);
var appStateDiffed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.APP_STATE_DIFFED);
var contentChangesCreated = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CONTENT_CHANGES_CREATED);
var newFileNameEntered = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.NEW_FILE_NAME_ENTERED);
var projectRenamed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.PROJECT_RENAMED);
var fileItemClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.FILE_ITEM_CLICKED);
var deleteProjectConfirmed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.DELETE_PROJECT_CONFIRMED);
var syncPanelsClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.SYNC_PANELS_CLICKED);
var getProjectRequestChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GET_PROJECT_REQUEST_CHANGED);
var getProjectsRequestChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GET_PROJECTS_REQUEST_CHANGED);
var getProjectFilesRequestChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GET_PROJECT_FILES_REQUEST_CHANGED);
var projectHookUsed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.PROJECT_HOOK_USED);
var projectFilesHookUsed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.PROJECT_FILES_HOOK_USED);
var allProjectsHookUsed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ALL_PROJECTS_HOOK_USED);


/***/ }),

/***/ "./src/frontend/sagas/engine-worker.ts":
/*!*********************************************!*\
  !*** ./src/frontend/sagas/engine-worker.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../actions */ "./src/frontend/actions/index.ts");
/* harmony import */ var paperclip_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! paperclip/browser */ "../paperclip/browser.js");
/* harmony import */ var paperclip_designer_src_actions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! paperclip-designer/src/actions */ "../paperclip-designer/src/actions/index.ts");
/* harmony import */ var fast_json_patch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! fast-json-patch */ "../../node_modules/fast-json-patch/index.mjs");
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
/* harmony import */ var paperclip_source_writer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! paperclip-source-writer */ "../paperclip-source-writer/lib/index.js");
/* harmony import */ var paperclip_source_writer__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(paperclip_source_writer__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! paperclip-utils */ "../paperclip-utils/index.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(paperclip_utils__WEBPACK_IMPORTED_MODULE_6__);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};








var init = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _state, _engine, _writer, _currentUri, dispatch, onCrash, handleInitialized, onEngineEvent, onEngineInit, tryOpeningCurrentFile, handleAppStateDiffed, syncEngineDocuments, handleVirtObjectEdited, handleProjectLoaded, handleRedirect;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dispatch = function (action) {
                    self.postMessage(action);
                };
                onCrash = function (e) {
                    dispatch((0,_actions__WEBPACK_IMPORTED_MODULE_0__.engineCrashed)(e));
                };
                handleInitialized = function (_a) {
                    var state = _a.payload.state;
                    _state = state;
                    tryOpeningCurrentFile();
                };
                onEngineEvent = function (event) {
                    dispatch((0,paperclip_designer_src_actions__WEBPACK_IMPORTED_MODULE_2__.engineDelegateChanged)(event));
                };
                onEngineInit = function () {
                    _writer = new paperclip_source_writer__WEBPACK_IMPORTED_MODULE_5__.PCSourceWriter({
                        engine: _engine,
                        getContent: function (uri) { return String(_state.documents[uri]); }
                    });
                    dispatch((0,_actions__WEBPACK_IMPORTED_MODULE_0__.engineLoaded)(null));
                    tryOpeningCurrentFile();
                };
                tryOpeningCurrentFile = function () {
                    if (_state.currentFileUri &&
                        _engine &&
                        (!_currentUri || _currentUri !== _state.currentFileUri)) {
                        _currentUri = _state.currentFileUri;
                        if ((0,paperclip_utils__WEBPACK_IMPORTED_MODULE_6__.isPaperclipFile)(_currentUri)) {
                            _engine.open(_state.currentFileUri);
                        }
                    }
                };
                handleAppStateDiffed = function (_a) {
                    var ops = _a.payload.ops;
                    return __awaiter(void 0, void 0, void 0, function () {
                        var oldState;
                        return __generator(this, function (_b) {
                            oldState = _state;
                            _state = (0,fast_json_patch__WEBPACK_IMPORTED_MODULE_3__.applyPatch)(_state, ops, false, false).newDocument;
                            syncEngineDocuments(oldState);
                            return [2 /*return*/];
                        });
                    });
                };
                syncEngineDocuments = function (oldState) {
                    if (_state.documents === oldState.documents || !_engine) {
                        return;
                    }
                    for (var uri in _state.documents) {
                        if (!(0,paperclip_utils__WEBPACK_IMPORTED_MODULE_6__.isPaperclipFile)(uri)) {
                            continue;
                        }
                        var newContent = _state.documents[uri];
                        var oldContent = oldState.documents[uri];
                        if (newContent !== oldContent && (0,paperclip_utils__WEBPACK_IMPORTED_MODULE_6__.isPaperclipFile)(uri)) {
                            _engine.updateVirtualFileContent(uri, String(newContent));
                        }
                    }
                };
                handleVirtObjectEdited = function (action) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    var _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _a = dispatch;
                                _b = _actions__WEBPACK_IMPORTED_MODULE_0__.contentChangesCreated;
                                _c = {};
                                return [4 /*yield*/, _writer.getContentChanges(action.payload.mutations)];
                            case 1:
                                _a.apply(void 0, [_b.apply(void 0, [(_c.changes = _d.sent(),
                                            _c)])]);
                                return [2 /*return*/];
                        }
                    });
                }); };
                handleProjectLoaded = function (action) {
                    if (!action.payload.result.data) {
                        return;
                    }
                    _engine.purgeUnlinkedFiles();
                };
                handleRedirect = function (action) {
                    tryOpeningCurrentFile();
                };
                self.onmessage = function (_a) {
                    var action = _a.data;
                    switch (action.type) {
                        case _actions__WEBPACK_IMPORTED_MODULE_0__.ActionType.GET_PROJECT_FILES_REQUEST_CHANGED:
                            return handleProjectLoaded(action);
                        case _actions__WEBPACK_IMPORTED_MODULE_0__.ActionType.WORKER_INITIALIZED:
                            return handleInitialized(action);
                        case _actions__WEBPACK_IMPORTED_MODULE_0__.ActionType.APP_STATE_DIFFED:
                            return handleAppStateDiffed(action);
                        case paperclip_designer_src_actions__WEBPACK_IMPORTED_MODULE_2__.ActionType.REDIRECT_REQUESTED:
                            return handleRedirect(action);
                        case paperclip_designer_src_actions__WEBPACK_IMPORTED_MODULE_2__.ActionType.PC_VIRT_OBJECT_EDITED:
                            return handleVirtObjectEdited(action);
                    }
                };
                return [4 /*yield*/, (0,paperclip_browser__WEBPACK_IMPORTED_MODULE_1__.loadEngineDelegate)({
                        io: {
                            readFile: function (uri) {
                                return _state.documents[uri];
                            },
                            fileExists: function (uri) {
                                return _state.documents[uri] != null;
                            },
                            resolveFile: function (fromPath, toPath) {
                                return url__WEBPACK_IMPORTED_MODULE_4__.resolve(fromPath, toPath);
                            }
                        }
                    }, onCrash)];
            case 1:
                _engine = _a.sent();
                _engine.onEvent(onEngineEvent);
                onEngineInit();
                return [2 /*return*/];
        }
    });
}); };
init();


/***/ }),

/***/ "../../node_modules/url/node_modules/punycode/punycode.js":
/*!****************************************************************!*\
  !*** ../../node_modules/url/node_modules/punycode/punycode.js ***!
  \****************************************************************/
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var __WEBPACK_AMD_DEFINE_RESULT__;/*! https://mths.be/punycode v1.3.2 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports =  true && exports &&
		!exports.nodeType && exports;
	var freeModule =  true && module &&
		!module.nodeType && module;
	var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.3.2',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		true
	) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
			return punycode;
		}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}

}(this));


/***/ }),

/***/ "../../node_modules/url/url.js":
/*!*************************************!*\
  !*** ../../node_modules/url/url.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var punycode = __webpack_require__(/*! punycode */ "../../node_modules/url/node_modules/punycode/punycode.js");
var util = __webpack_require__(/*! ./util */ "../../node_modules/url/util.js");

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = __webpack_require__(/*! querystring */ "../../node_modules/querystring/index.js");

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};


/***/ }),

/***/ "../../node_modules/url/util.js":
/*!**************************************!*\
  !*** ../../node_modules/url/util.js ***!
  \**************************************/
/***/ ((module) => {

"use strict";


module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};


/***/ }),

/***/ "../../node_modules/yallist/iterator.js":
/*!**********************************************!*\
  !*** ../../node_modules/yallist/iterator.js ***!
  \**********************************************/
/***/ ((module) => {

"use strict";

module.exports = function (Yallist) {
  Yallist.prototype[Symbol.iterator] = function* () {
    for (let walker = this.head; walker; walker = walker.next) {
      yield walker.value
    }
  }
}


/***/ }),

/***/ "../../node_modules/yallist/yallist.js":
/*!*********************************************!*\
  !*** ../../node_modules/yallist/yallist.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Yallist

Yallist.Node = Node
Yallist.create = Yallist

function Yallist (list) {
  var self = this
  if (!(self instanceof Yallist)) {
    self = new Yallist()
  }

  self.tail = null
  self.head = null
  self.length = 0

  if (list && typeof list.forEach === 'function') {
    list.forEach(function (item) {
      self.push(item)
    })
  } else if (arguments.length > 0) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      self.push(arguments[i])
    }
  }

  return self
}

Yallist.prototype.removeNode = function (node) {
  if (node.list !== this) {
    throw new Error('removing node which does not belong to this list')
  }

  var next = node.next
  var prev = node.prev

  if (next) {
    next.prev = prev
  }

  if (prev) {
    prev.next = next
  }

  if (node === this.head) {
    this.head = next
  }
  if (node === this.tail) {
    this.tail = prev
  }

  node.list.length--
  node.next = null
  node.prev = null
  node.list = null

  return next
}

Yallist.prototype.unshiftNode = function (node) {
  if (node === this.head) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var head = this.head
  node.list = this
  node.next = head
  if (head) {
    head.prev = node
  }

  this.head = node
  if (!this.tail) {
    this.tail = node
  }
  this.length++
}

Yallist.prototype.pushNode = function (node) {
  if (node === this.tail) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var tail = this.tail
  node.list = this
  node.prev = tail
  if (tail) {
    tail.next = node
  }

  this.tail = node
  if (!this.head) {
    this.head = node
  }
  this.length++
}

Yallist.prototype.push = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    push(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.unshift = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    unshift(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.pop = function () {
  if (!this.tail) {
    return undefined
  }

  var res = this.tail.value
  this.tail = this.tail.prev
  if (this.tail) {
    this.tail.next = null
  } else {
    this.head = null
  }
  this.length--
  return res
}

Yallist.prototype.shift = function () {
  if (!this.head) {
    return undefined
  }

  var res = this.head.value
  this.head = this.head.next
  if (this.head) {
    this.head.prev = null
  } else {
    this.tail = null
  }
  this.length--
  return res
}

Yallist.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.head, i = 0; walker !== null; i++) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.next
  }
}

Yallist.prototype.forEachReverse = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.prev
  }
}

Yallist.prototype.get = function (n) {
  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.next
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.getReverse = function (n) {
  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.prev
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.map = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.head; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.next
  }
  return res
}

Yallist.prototype.mapReverse = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.tail; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.prev
  }
  return res
}

Yallist.prototype.reduce = function (fn, initial) {
  var acc
  var walker = this.head
  if (arguments.length > 1) {
    acc = initial
  } else if (this.head) {
    walker = this.head.next
    acc = this.head.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = 0; walker !== null; i++) {
    acc = fn(acc, walker.value, i)
    walker = walker.next
  }

  return acc
}

Yallist.prototype.reduceReverse = function (fn, initial) {
  var acc
  var walker = this.tail
  if (arguments.length > 1) {
    acc = initial
  } else if (this.tail) {
    walker = this.tail.prev
    acc = this.tail.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = this.length - 1; walker !== null; i--) {
    acc = fn(acc, walker.value, i)
    walker = walker.prev
  }

  return acc
}

Yallist.prototype.toArray = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.head; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.next
  }
  return arr
}

Yallist.prototype.toArrayReverse = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.tail; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.prev
  }
  return arr
}

Yallist.prototype.slice = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
    walker = walker.next
  }
  for (; walker !== null && i < to; i++, walker = walker.next) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.sliceReverse = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
    walker = walker.prev
  }
  for (; walker !== null && i > from; i--, walker = walker.prev) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.splice = function (start, deleteCount, ...nodes) {
  if (start > this.length) {
    start = this.length - 1
  }
  if (start < 0) {
    start = this.length + start;
  }

  for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
    walker = walker.next
  }

  var ret = []
  for (var i = 0; walker && i < deleteCount; i++) {
    ret.push(walker.value)
    walker = this.removeNode(walker)
  }
  if (walker === null) {
    walker = this.tail
  }

  if (walker !== this.head && walker !== this.tail) {
    walker = walker.prev
  }

  for (var i = 0; i < nodes.length; i++) {
    walker = insert(this, walker, nodes[i])
  }
  return ret;
}

Yallist.prototype.reverse = function () {
  var head = this.head
  var tail = this.tail
  for (var walker = head; walker !== null; walker = walker.prev) {
    var p = walker.prev
    walker.prev = walker.next
    walker.next = p
  }
  this.head = tail
  this.tail = head
  return this
}

function insert (self, node, value) {
  var inserted = node === self.head ?
    new Node(value, null, node, self) :
    new Node(value, node, node.next, self)

  if (inserted.next === null) {
    self.tail = inserted
  }
  if (inserted.prev === null) {
    self.head = inserted
  }

  self.length++

  return inserted
}

function push (self, item) {
  self.tail = new Node(item, self.tail, null, self)
  if (!self.head) {
    self.head = self.tail
  }
  self.length++
}

function unshift (self, item) {
  self.head = new Node(item, null, self.head, self)
  if (!self.tail) {
    self.tail = self.head
  }
  self.length++
}

function Node (value, prev, next, list) {
  if (!(this instanceof Node)) {
    return new Node(value, prev, next, list)
  }

  this.list = list
  this.value = value

  if (prev) {
    prev.next = this
    this.prev = prev
  } else {
    this.prev = null
  }

  if (next) {
    next.prev = this
    this.next = next
  } else {
    this.next = null
  }
}

try {
  // add if support for Symbol.iterator is present
  __webpack_require__(/*! ./iterator.js */ "../../node_modules/yallist/iterator.js")(Yallist)
} catch (er) {}


/***/ }),

/***/ "../paperclip-source-writer/lib/index.js":
/*!***********************************************!*\
  !*** ../paperclip-source-writer/lib/index.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./writer */ "../paperclip-source-writer/lib/writer.js"), exports);
__exportStar(__webpack_require__(/*! ./mutations */ "../paperclip-source-writer/lib/mutations.js"), exports);


/***/ }),

/***/ "../paperclip-source-writer/lib/mutations.js":
/*!***************************************************!*\
  !*** ../paperclip-source-writer/lib/mutations.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PCMutationActionKind = void 0;
var PCMutationActionKind;
(function (PCMutationActionKind) {
    PCMutationActionKind["ANNOTATIONS_CHANGED"] = "ANNOTATIONS_CHANGED";
    PCMutationActionKind["EXPRESSION_DELETED"] = "EXPRESSION_DELETED";
})(PCMutationActionKind = exports.PCMutationActionKind || (exports.PCMutationActionKind = {}));


/***/ }),

/***/ "../paperclip-source-writer/lib/writer.js":
/*!************************************************!*\
  !*** ../paperclip-source-writer/lib/writer.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PCSourceWriter = void 0;
var mutations_1 = __webpack_require__(/*! ./mutations */ "../paperclip-source-writer/lib/mutations.js");
var paperclip_utils_1 = __webpack_require__(/*! paperclip-utils */ "../paperclip-utils/index.js");
var ANNOTATION_KEYS = ["title", "width", "height", "x", "y"];
var PCSourceWriter = /** @class */ (function () {
    function PCSourceWriter(_options) {
        this._options = _options;
    }
    PCSourceWriter.prototype.getContentChanges = function (mutations) {
        return __awaiter(this, void 0, void 0, function () {
            var changes, engine, _i, mutations_2, _a, exprSource, action, ast, _b, _c, changesByUri, _d, changes_1, change;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        changes = [];
                        engine = this._options.engine;
                        _i = 0, mutations_2 = mutations;
                        _e.label = 1;
                    case 1:
                        if (!(_i < mutations_2.length)) return [3 /*break*/, 4];
                        _a = mutations_2[_i], exprSource = _a.exprSource, action = _a.action;
                        _c = (_b = engine).parseContent;
                        return [4 /*yield*/, this._options.getContent(exprSource.uri)];
                    case 2:
                        ast = _c.apply(_b, [_e.sent()]);
                        switch (action.kind) {
                            case mutations_1.PCMutationActionKind.ANNOTATIONS_CHANGED: {
                                changes.push(this._getAnnotationChange(exprSource, action.annotationsSource, action.annotations));
                                break;
                            }
                            case mutations_1.PCMutationActionKind.EXPRESSION_DELETED: {
                                changes.push.apply(changes, this._getExpressionDeletedChanged(exprSource, ast));
                                break;
                            }
                        }
                        _e.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        changesByUri = {};
                        for (_d = 0, changes_1 = changes; _d < changes_1.length; _d++) {
                            change = changes_1[_d];
                            if (!changesByUri[change.uri]) {
                                changesByUri[change.uri] = [];
                            }
                            changesByUri[change.uri].push(change);
                        }
                        return [2 /*return*/, changesByUri];
                }
            });
        });
    };
    PCSourceWriter.prototype._getExpressionDeletedChanged = function (exprSource, ast) {
        var node = getAssocNode(exprSource, ast);
        var parent = paperclip_utils_1.getParentNode(node, ast);
        var childIndex = parent.children.findIndex(function (child) { return child === node; });
        var changes = [];
        var beforeChild = childIndex > 0 ? parent.children[childIndex - 1] : null;
        // if before child is a comment, then assume it's an annotation
        if (beforeChild && beforeChild.kind === paperclip_utils_1.NodeKind.Comment) {
            changes.push({
                uri: exprSource.uri,
                start: beforeChild.location.start,
                end: beforeChild.location.end,
                value: ""
            });
        }
        changes.push({
            uri: exprSource.uri,
            start: exprSource.location.start,
            end: exprSource.location.end,
            value: ""
        });
        return changes;
    };
    PCSourceWriter.prototype._getAnnotationChange = function (exprSource, annotationsSource, annotations) {
        var buffer = ["<!--\n"];
        for (var key in annotations) {
            var chunk = ["  @" + key + " "];
            var value = annotations[key];
            if (Array.isArray(value) ||
                typeof value === "string" ||
                typeof value === "number") {
                chunk.push(JSON.stringify(value));
            }
            else {
                chunk.push("{ ");
                var items = [];
                var sortedKeys = Object.keys(value).sort(function (a, b) {
                    return ANNOTATION_KEYS.indexOf(a) < ANNOTATION_KEYS.indexOf(b)
                        ? -1
                        : 1;
                });
                for (var _i = 0, sortedKeys_1 = sortedKeys; _i < sortedKeys_1.length; _i++) {
                    var k = sortedKeys_1[_i];
                    items.push(k + ": " + JSON.stringify(value[k]));
                }
                chunk.push(items.join(", "), " }");
            }
            buffer.push(chunk.join(""), "\n");
        }
        buffer.push("-->");
        // insertion - give it some padding
        if (!annotationsSource) {
            buffer.unshift("\n");
            buffer.push("\n");
        }
        return {
            uri: exprSource.uri,
            start: annotationsSource
                ? annotationsSource.location.start
                : exprSource.location.start,
            end: annotationsSource
                ? annotationsSource.location.end
                : exprSource.location.start,
            // newline may have been clipped off, so re-add if that happens
            value: buffer.join("")
        };
    };
    return PCSourceWriter;
}());
exports.PCSourceWriter = PCSourceWriter;
var getAssocNode = function (exprSource, root) {
    var foundExpr;
    paperclip_utils_1.traverseExpression(root, function (node) {
        if (node.location.start === exprSource.location.start &&
            node.location.end === exprSource.location.end) {
            foundExpr = node;
            return false;
        }
    });
    // should NOT happen
    if (!foundExpr) {
        console.error("[PCSourceWriter] Cannot find associated node, content is likely out of sync with visual editor.");
    }
    return foundExpr;
};


/***/ }),

/***/ "../paperclip-utils/index.js":
/*!***********************************!*\
  !*** ../paperclip-utils/index.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib */ "../paperclip-utils/lib/index.js");


/***/ }),

/***/ "../paperclip-utils/lib/ast.js":
/*!*************************************!*\
  !*** ../paperclip-utils/lib/ast.js ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getNestedReferences = exports.getCompletionItems = exports.traverseExpression = exports.isAttributeValue = exports.isAttribute = exports.isNode = exports.getMixins = exports.isComponentInstance = exports.getTreeNodeMap = exports.getParentNode = exports.getNodePath = exports.flattenTreeNode = exports.hasAttribute = exports.getLogicElement = exports.getDefaultPart = exports.getPartIds = exports.getParts = exports.getVisibleChildNodes = exports.isVisibleNode = exports.isVisibleElement = exports.getStyleElements = exports.getAttributeStringValue = exports.getAttributeValue = exports.getAttribute = exports.getMetaValue = exports.findByNamespace = exports.getChildrenByTagName = exports.getStyleScopeId = exports.getChildren = exports.getImportById = exports.getImportIds = exports.getRelativeFilePath = exports.getImports = exports.DynamicStringAttributeValuePartKind = exports.AttributeValueKind = exports.AttributeKind = exports.AnnotationPropertyKind = exports.NodeKind = void 0;
var js_ast_1 = __webpack_require__(/*! ./js-ast */ "../paperclip-utils/lib/js-ast.js");
var css_ast_1 = __webpack_require__(/*! ./css-ast */ "../paperclip-utils/lib/css-ast.js");
var crc32 = __webpack_require__(/*! crc32 */ "../../node_modules/crc32/lib/crc32.js");
var resolve_1 = __webpack_require__(/*! ./resolve */ "../paperclip-utils/lib/resolve.js");
var path = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
var constants_1 = __webpack_require__(/*! ./constants */ "../paperclip-utils/lib/constants.js");
var memo_1 = __webpack_require__(/*! ./memo */ "../paperclip-utils/lib/memo.js");
var NodeKind;
(function (NodeKind) {
    NodeKind["Fragment"] = "Fragment";
    NodeKind["Text"] = "Text";
    NodeKind["Annotation"] = "Annotation";
    NodeKind["Comment"] = "Comment";
    NodeKind["Element"] = "Element";
    NodeKind["StyleElement"] = "StyleElement";
    NodeKind["Slot"] = "Slot";
})(NodeKind = exports.NodeKind || (exports.NodeKind = {}));
var AnnotationPropertyKind;
(function (AnnotationPropertyKind) {
    AnnotationPropertyKind["Text"] = "Text";
    AnnotationPropertyKind["Declaration"] = "Declaration";
})(AnnotationPropertyKind = exports.AnnotationPropertyKind || (exports.AnnotationPropertyKind = {}));
var AttributeKind;
(function (AttributeKind) {
    AttributeKind["ShorthandAttribute"] = "ShorthandAttribute";
    AttributeKind["KeyValueAttribute"] = "KeyValueAttribute";
    AttributeKind["SpreadAttribute"] = "SpreadAttribute";
    AttributeKind["PropertyBoundAttribute"] = "PropertyBoundAttribute";
})(AttributeKind = exports.AttributeKind || (exports.AttributeKind = {}));
var AttributeValueKind;
(function (AttributeValueKind) {
    AttributeValueKind["DyanmicString"] = "DyanmicString";
    AttributeValueKind["String"] = "String";
    AttributeValueKind["Slot"] = "Slot";
})(AttributeValueKind = exports.AttributeValueKind || (exports.AttributeValueKind = {}));
var DynamicStringAttributeValuePartKind;
(function (DynamicStringAttributeValuePartKind) {
    DynamicStringAttributeValuePartKind["Literal"] = "Literal";
    DynamicStringAttributeValuePartKind["ClassNamePierce"] = "ClassNamePierce";
    DynamicStringAttributeValuePartKind["Slot"] = "Slot";
})(DynamicStringAttributeValuePartKind = exports.DynamicStringAttributeValuePartKind || (exports.DynamicStringAttributeValuePartKind = {}));
var a = null;
var getImports = function (ast) {
    return exports.getChildrenByTagName("import", ast).filter(function (child) {
        return exports.hasAttribute("src", child);
    });
};
exports.getImports = getImports;
var getRelativeFilePath = function (fs) { return function (fromFilePath, importFilePath) {
    var logicPath = resolve_1.resolveImportFile(fs)(fromFilePath, importFilePath);
    var relativePath = path.relative(path.dirname(fromFilePath), logicPath);
    if (relativePath.charAt(0) !== ".") {
        relativePath = "./" + relativePath;
    }
    return relativePath;
}; };
exports.getRelativeFilePath = getRelativeFilePath;
var getImportIds = function (ast) {
    return exports.getImports(ast)
        .map(function (node) { return exports.getAttributeStringValue(constants_1.AS_ATTR_NAME, node); })
        .filter(Boolean);
};
exports.getImportIds = getImportIds;
var getImportById = function (id, ast) {
    return exports.getImports(ast).find(function (imp) {
        return exports.getAttributeStringValue(constants_1.AS_ATTR_NAME, imp) === id;
    });
};
exports.getImportById = getImportById;
var getChildren = function (ast) {
    if (ast.kind === NodeKind.Element || ast.kind === NodeKind.Fragment) {
        return ast.children;
    }
    return [];
};
exports.getChildren = getChildren;
var getStyleScopeId = function (filePath) { return crc32(filePath); };
exports.getStyleScopeId = getStyleScopeId;
var getChildrenByTagName = function (tagName, parent) {
    return exports.getChildren(parent).filter(function (child) {
        return child.kind === NodeKind.Element && child.tagName === tagName;
    });
};
exports.getChildrenByTagName = getChildrenByTagName;
var findByNamespace = function (namespace, current, allChildrenByNamespace) {
    if (allChildrenByNamespace === void 0) { allChildrenByNamespace = []; }
    if (current.kind === NodeKind.Element) {
        if (current.tagName.split(".")[0] === namespace) {
            allChildrenByNamespace.push(current);
        }
    }
    for (var _i = 0, _a = exports.getChildren(current); _i < _a.length; _i++) {
        var child = _a[_i];
        exports.findByNamespace(namespace, child, allChildrenByNamespace);
    }
    if (current.kind === NodeKind.Element) {
        for (var _b = 0, _c = current.attributes; _b < _c.length; _b++) {
            var attribute = _c[_b];
            if (attribute.kind === AttributeKind.KeyValueAttribute &&
                attribute.value) {
                if (attribute.value.attrValueKind === AttributeValueKind.Slot &&
                    attribute.value.script.jsKind === js_ast_1.JsExpressionKind.Node) {
                    exports.findByNamespace(namespace, attribute.value.script, allChildrenByNamespace);
                }
            }
        }
    }
    return allChildrenByNamespace;
};
exports.findByNamespace = findByNamespace;
var getMetaValue = function (name, root) {
    var metaElement = exports.getChildrenByTagName("meta", root).find(function (meta) {
        return exports.hasAttribute("src", meta) &&
            exports.getAttributeStringValue("name", meta) === name;
    });
    return metaElement && exports.getAttributeStringValue("content", metaElement);
};
exports.getMetaValue = getMetaValue;
var getAttribute = function (name, element) {
    return element.attributes.find(function (attr) {
        return attr.kind === AttributeKind.KeyValueAttribute && attr.name === name;
    });
};
exports.getAttribute = getAttribute;
var getAttributeValue = function (name, element) {
    var attr = exports.getAttribute(name, element);
    return attr && attr.value;
};
exports.getAttributeValue = getAttributeValue;
var getAttributeStringValue = function (name, element) {
    var value = exports.getAttributeValue(name, element);
    return (value && value.attrValueKind === AttributeValueKind.String && value.value);
};
exports.getAttributeStringValue = getAttributeStringValue;
var getStyleElements = function (ast) {
    var styleElements = [];
    exports.traverseExpression(ast, function (node) {
        if (node.kind === NodeKind.StyleElement) {
            styleElements.push(node);
        }
    });
    return styleElements;
};
exports.getStyleElements = getStyleElements;
var isVisibleElement = function (ast) {
    return !/^(import|logic|meta|style|part|preview)$/.test(ast.tagName);
};
exports.isVisibleElement = isVisibleElement;
var isVisibleNode = function (node) {
    return node.kind === NodeKind.Text ||
        node.kind === NodeKind.Fragment ||
        node.kind === NodeKind.Slot ||
        (node.kind === NodeKind.Element && exports.isVisibleElement(node));
};
exports.isVisibleNode = isVisibleNode;
var getVisibleChildNodes = function (ast) {
    return exports.getChildren(ast).filter(exports.isVisibleNode);
};
exports.getVisibleChildNodes = getVisibleChildNodes;
var getParts = function (ast) {
    return exports.getChildren(ast).filter(function (child) {
        return (child.kind === NodeKind.Element &&
            exports.hasAttribute("component", child) &&
            exports.hasAttribute(constants_1.AS_ATTR_NAME, child));
    });
};
exports.getParts = getParts;
var getPartIds = function (ast) {
    return exports.getParts(ast)
        .map(function (node) { return exports.getAttributeStringValue(constants_1.AS_ATTR_NAME, node); })
        .filter(Boolean);
};
exports.getPartIds = getPartIds;
var getDefaultPart = function (ast) {
    return exports.getParts(ast).find(function (part) { return exports.getAttributeStringValue(constants_1.AS_ATTR_NAME, part) === constants_1.DEFAULT_PART_ID; });
};
exports.getDefaultPart = getDefaultPart;
var getLogicElement = function (ast) {
    return exports.getChildren(ast).find(function (child) { return child.kind === NodeKind.Element && child.tagName === constants_1.LOGIC_TAG_NAME; });
};
exports.getLogicElement = getLogicElement;
var hasAttribute = function (name, element) {
    return exports.getAttribute(name, element) != null;
};
exports.hasAttribute = hasAttribute;
// https://github.com/crcn/tandem/blob/10.0.0/packages/common/src/state/tree.ts#L137
exports.flattenTreeNode = memo_1.memoize(function (current) {
    var treeNodeMap = exports.getTreeNodeMap(current);
    return Object.values(treeNodeMap);
});
exports.getNodePath = memo_1.memoize(function (node, root) {
    var map = exports.getTreeNodeMap(root);
    for (var path_1 in map) {
        var c = map[path_1];
        if (c === node)
            return path_1;
    }
});
// TODO
var getParentNode = function (node, root) {
    var nodePath = exports.getNodePath(node, root).split(".");
    nodePath.pop();
    var map = exports.getTreeNodeMap(root);
    return map[nodePath.join(".")];
};
exports.getParentNode = getParentNode;
exports.getTreeNodeMap = memo_1.memoize(function (current, path) {
    var _a;
    if (path === void 0) { path = "0"; }
    var map = (_a = {},
        _a[path] = current,
        _a);
    if (current.kind === NodeKind.Fragment ||
        current.kind === NodeKind.Element) {
        Object.assign.apply(Object, __spreadArrays([map], current.children.map(function (child, i) {
            return exports.getTreeNodeMap(child, path + "." + i);
        })));
    }
    return map;
});
var isComponentInstance = function (node, importIds) {
    return (node.kind === NodeKind.Element &&
        importIds.indexOf(node.tagName.split(".").shift()) !== -1);
};
exports.isComponentInstance = isComponentInstance;
var maybeAddReference = function (stmt, _statements) {
    if (_statements === void 0) { _statements = []; }
    if (stmt.jsKind === js_ast_1.JsExpressionKind.Reference) {
        _statements.push([stmt, null]);
    }
};
var getMixins = function (ast) {
    var styles = exports.getStyleElements(ast);
    var mixins = {};
    for (var _i = 0, styles_1 = styles; _i < styles_1.length; _i++) {
        var style = styles_1[_i];
        css_ast_1.traverseSheet(style.sheet, function (rule) {
            if (rule && css_ast_1.isRule(rule) && rule.kind === css_ast_1.RuleKind.Mixin) {
                mixins[rule.name.value] = rule;
            }
        });
    }
    return mixins;
};
exports.getMixins = getMixins;
var isNode = function (ast) {
    return NodeKind[ast.kind] != null;
};
exports.isNode = isNode;
var isAttribute = function (ast) {
    return AttributeKind[ast.kind] != null;
};
exports.isAttribute = isAttribute;
var isAttributeValue = function (ast) {
    return AttributeValueKind[ast.attrValueKind] != null;
};
exports.isAttributeValue = isAttributeValue;
var traverseExpression = function (ast, each) {
    if (each(ast) === false) {
        return false;
    }
    if (exports.isNode(ast)) {
        switch (ast.kind) {
            case NodeKind.Element: {
                return (traverseExpressions(ast.attributes, each) &&
                    traverseExpressions(ast.children, each));
            }
            case NodeKind.Fragment: {
                return traverseExpressions(ast.children, each);
            }
            case NodeKind.StyleElement: {
                return css_ast_1.traverseSheet(ast.sheet, each);
            }
        }
    }
    return true;
};
exports.traverseExpression = traverseExpression;
var getCompletionItems = function (root, position) {
    var parent;
    var previousSibling;
    exports.traverseExpression(root, function (expr) {
        if (!expr.location) {
            console.error("ERRRR", expr);
        }
    });
};
exports.getCompletionItems = getCompletionItems;
var traverseExpressions = function (expressions, each) {
    for (var _i = 0, expressions_1 = expressions; _i < expressions_1.length; _i++) {
        var child = expressions_1[_i];
        if (!exports.traverseExpression(child, each)) {
            return false;
        }
    }
    return true;
};
var getNestedReferences = function (node, _statements) {
    if (_statements === void 0) { _statements = []; }
    if (node.kind === NodeKind.Slot) {
        maybeAddReference(node.script, _statements);
    }
    else {
        if (node.kind === NodeKind.Element) {
            for (var _i = 0, _a = node.attributes; _i < _a.length; _i++) {
                var attr = _a[_i];
                if (attr.kind == AttributeKind.KeyValueAttribute &&
                    attr.value &&
                    attr.value.attrValueKind === AttributeValueKind.Slot) {
                    if (attr.value.script.jsKind === js_ast_1.JsExpressionKind.Node) {
                        exports.getNestedReferences(attr.value.script, _statements);
                    }
                    else if (attr.value.script.jsKind === js_ast_1.JsExpressionKind.Reference) {
                        _statements.push([attr.value.script, attr.name]);
                    }
                }
                else if (attr.kind === AttributeKind.ShorthandAttribute &&
                    attr.reference.jsKind === js_ast_1.JsExpressionKind.Reference) {
                    _statements.push([attr.reference, attr.reference[0]]);
                }
                else if (attr.kind === AttributeKind.SpreadAttribute &&
                    attr.script.jsKind === js_ast_1.JsExpressionKind.Reference) {
                    _statements.push([attr.script, attr.script[0]]);
                }
            }
        }
        for (var _b = 0, _c = exports.getChildren(node); _b < _c.length; _b++) {
            var child = _c[_b];
            if (child.kind === NodeKind.Element &&
                exports.hasAttribute(constants_1.PREVIEW_ATTR_NAME, child)) {
                continue;
            }
            exports.getNestedReferences(child, _statements);
        }
    }
    return _statements;
};
exports.getNestedReferences = getNestedReferences;


/***/ }),

/***/ "../paperclip-utils/lib/base-ast.js":
/*!******************************************!*\
  !*** ../paperclip-utils/lib/base-ast.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../paperclip-utils/lib/base-virt.js":
/*!*******************************************!*\
  !*** ../paperclip-utils/lib/base-virt.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../paperclip-utils/lib/config.js":
/*!****************************************!*\
  !*** ../paperclip-utils/lib/config.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../paperclip-utils/lib/constants.js":
/*!*******************************************!*\
  !*** ../paperclip-utils/lib/constants.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LOGIC_TAG_NAME = exports.AS_ATTR_NAME = exports.FRAGMENT_TAG_NAME = exports.PREVIEW_ATTR_NAME = exports.COMPONENT_ATTR_NAME = exports.EXPORT_TAG_NAME = exports.DEFAULT_PART_ID = exports.PC_CONFIG_FILE_NAME = void 0;
exports.PC_CONFIG_FILE_NAME = "paperclip.config.json";
exports.DEFAULT_PART_ID = "default";
exports.EXPORT_TAG_NAME = "export";
exports.COMPONENT_ATTR_NAME = "component";
exports.PREVIEW_ATTR_NAME = "preview";
exports.FRAGMENT_TAG_NAME = "fragment";
exports.AS_ATTR_NAME = "as";
// deprecated
exports.LOGIC_TAG_NAME = "logic";


/***/ }),

/***/ "../paperclip-utils/lib/css-ast.js":
/*!*****************************************!*\
  !*** ../paperclip-utils/lib/css-ast.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSelectorClassNames = exports.traverseStyleExpression = exports.isIncludePart = exports.isStyleDeclaration = exports.isRule = exports.traverseSheet = exports.getRuleClassNames = exports.getSheetClassNames = exports.StyleDeclarationKind = exports.SelectorKind = exports.RuleKind = void 0;
var RuleKind;
(function (RuleKind) {
    RuleKind["Style"] = "Style";
    RuleKind["Charset"] = "Charset";
    RuleKind["Namespace"] = "Namespace";
    RuleKind["Include"] = "Include";
    RuleKind["FontFace"] = "FontFace";
    RuleKind["Media"] = "Media";
    RuleKind["Mixin"] = "Mixin";
    RuleKind["Export"] = "Export";
    RuleKind["Supports"] = "Supports";
    RuleKind["Page"] = "Page";
    RuleKind["Document"] = "Document";
    RuleKind["Keyframes"] = "Keyframes";
})(RuleKind = exports.RuleKind || (exports.RuleKind = {}));
var SelectorKind;
(function (SelectorKind) {
    SelectorKind["Group"] = "Group";
    SelectorKind["Combo"] = "Combo";
    SelectorKind["Descendent"] = "Descendent";
    SelectorKind["PseudoElement"] = "PseudoElement";
    SelectorKind["PseudoParamElement"] = "PseudoParamElement";
    SelectorKind["Not"] = "Not";
    SelectorKind["Child"] = "Child";
    SelectorKind["Adjacent"] = "Adjacent";
    SelectorKind["Sibling"] = "Sibling";
    SelectorKind["Id"] = "Id";
    SelectorKind["Element"] = "Element";
    SelectorKind["Attribute"] = "Attribute";
    SelectorKind["Class"] = "Class";
    SelectorKind["AllSelector"] = "AllSelector";
})(SelectorKind = exports.SelectorKind || (exports.SelectorKind = {}));
var StyleDeclarationKind;
(function (StyleDeclarationKind) {
    StyleDeclarationKind["KeyValue"] = "KeyValue";
    StyleDeclarationKind["Include"] = "Include";
    StyleDeclarationKind["Media"] = "Media";
    StyleDeclarationKind["Content"] = "Content";
})(StyleDeclarationKind = exports.StyleDeclarationKind || (exports.StyleDeclarationKind = {}));
var getSheetClassNames = function (sheet, allClassNames) {
    if (allClassNames === void 0) { allClassNames = []; }
    return getRulesClassNames(sheet.rules, allClassNames);
};
exports.getSheetClassNames = getSheetClassNames;
var getRulesClassNames = function (rules, allClassNames) {
    if (allClassNames === void 0) { allClassNames = []; }
    for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
        var rule = rules_1[_i];
        exports.getRuleClassNames(rule, allClassNames);
    }
    return allClassNames;
};
var getRuleClassNames = function (rule, allClassNames) {
    if (allClassNames === void 0) { allClassNames = []; }
    switch (rule.kind) {
        case RuleKind.Media: {
            getRulesClassNames(rule.rules, allClassNames);
            break;
        }
        case RuleKind.Style: {
            exports.getSelectorClassNames(rule.selector, allClassNames);
            break;
        }
    }
    return allClassNames;
};
exports.getRuleClassNames = getRuleClassNames;
var traverseSheet = function (sheet, each) {
    return traverseStyleExpressions(sheet.rules, each);
};
exports.traverseSheet = traverseSheet;
var traverseStyleExpressions = function (rules, each) {
    for (var _i = 0, rules_2 = rules; _i < rules_2.length; _i++) {
        var rule = rules_2[_i];
        if (!exports.traverseStyleExpression(rule, each)) {
            return false;
        }
    }
    return true;
};
var isRule = function (expression) {
    return RuleKind[expression.kind] != null;
};
exports.isRule = isRule;
var isStyleDeclaration = function (expression) {
    return (StyleDeclarationKind[expression.declarationKind] !=
        null);
};
exports.isStyleDeclaration = isStyleDeclaration;
var isIncludePart = function (expression) {
    return expression.name != null;
};
exports.isIncludePart = isIncludePart;
var traverseStyleExpression = function (rule, each) {
    if (each(rule) === false) {
        return false;
    }
    if (exports.isRule(rule)) {
        switch (rule.kind) {
            case RuleKind.Media: {
                return traverseStyleExpressions(rule.rules, each);
            }
            case RuleKind.Export: {
                return traverseStyleExpressions(rule.rules, each);
            }
            case RuleKind.Style: {
                return (traverseStyleExpressions(rule.declarations, each) &&
                    traverseStyleExpressions(rule.children, each));
            }
            case RuleKind.Mixin: {
                return traverseStyleExpressions(rule.declarations, each);
            }
        }
    }
    else if (exports.isStyleDeclaration(rule)) {
        switch (rule.declarationKind) {
            case StyleDeclarationKind.Include: {
                for (var _i = 0, _a = rule.mixinName.parts; _i < _a.length; _i++) {
                    var part = _a[_i];
                    if (!exports.traverseStyleExpression(part, each)) {
                        return false;
                    }
                }
                return true;
            }
        }
    }
    return true;
};
exports.traverseStyleExpression = traverseStyleExpression;
var getSelectorClassNames = function (selector, allClassNames) {
    if (allClassNames === void 0) { allClassNames = []; }
    switch (selector.kind) {
        case SelectorKind.Combo:
        case SelectorKind.Group: {
            for (var _i = 0, _a = selector.selectors; _i < _a.length; _i++) {
                var child = _a[_i];
                exports.getSelectorClassNames(child, allClassNames);
            }
            break;
        }
        case SelectorKind.Descendent: {
            exports.getSelectorClassNames(selector.ancestor, allClassNames);
            exports.getSelectorClassNames(selector.descendent, allClassNames);
            break;
        }
        case SelectorKind.PseudoElement: {
            exports.getSelectorClassNames(selector.target, allClassNames);
            break;
        }
        case SelectorKind.PseudoParamElement: {
            exports.getSelectorClassNames(selector.target, allClassNames);
            break;
        }
        case SelectorKind.Not: {
            exports.getSelectorClassNames(selector.selector, allClassNames);
            break;
        }
        case SelectorKind.Child: {
            exports.getSelectorClassNames(selector.parent, allClassNames);
            exports.getSelectorClassNames(selector.child, allClassNames);
            break;
        }
        case SelectorKind.Adjacent: {
            exports.getSelectorClassNames(selector.selector, allClassNames);
            exports.getSelectorClassNames(selector.nextSiblingSelector, allClassNames);
            break;
        }
        case SelectorKind.Sibling: {
            exports.getSelectorClassNames(selector.selector, allClassNames);
            exports.getSelectorClassNames(selector.siblingSelector, allClassNames);
            break;
        }
        case SelectorKind.Class: {
            allClassNames.push(selector.className);
            break;
        }
    }
    return allClassNames;
};
exports.getSelectorClassNames = getSelectorClassNames;


/***/ }),

/***/ "../paperclip-utils/lib/css-virt.js":
/*!******************************************!*\
  !*** ../paperclip-utils/lib/css-virt.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VirtRuleKind = void 0;
var VirtRuleKind;
(function (VirtRuleKind) {
    VirtRuleKind["Style"] = "Style";
    VirtRuleKind["Media"] = "Media";
})(VirtRuleKind = exports.VirtRuleKind || (exports.VirtRuleKind = {}));


/***/ }),

/***/ "../paperclip-utils/lib/events.js":
/*!****************************************!*\
  !*** ../paperclip-utils/lib/events.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// TODO  - move all non-specific event stuff to payload, or data prop so that
// event can remain ephemeral.
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GraphErrorInfoType = exports.ParseErrorKind = exports.EngineErrorKind = exports.EngineDelegateEventKind = void 0;
var EngineDelegateEventKind;
(function (EngineDelegateEventKind) {
    EngineDelegateEventKind["Loading"] = "Loading";
    EngineDelegateEventKind["Deleted"] = "Deleted";
    EngineDelegateEventKind["Loaded"] = "Loaded";
    EngineDelegateEventKind["Updating"] = "Updating";
    EngineDelegateEventKind["Evaluated"] = "Evaluated";
    EngineDelegateEventKind["Error"] = "Error";
    EngineDelegateEventKind["NodeParsed"] = "NodeParsed";
    EngineDelegateEventKind["Diffed"] = "Diffed";
    EngineDelegateEventKind["ChangedSheets"] = "ChangedSheets";
})(EngineDelegateEventKind = exports.EngineDelegateEventKind || (exports.EngineDelegateEventKind = {}));
var EngineErrorKind;
(function (EngineErrorKind) {
    EngineErrorKind["Graph"] = "Graph";
    EngineErrorKind["Runtime"] = "Runtime";
})(EngineErrorKind = exports.EngineErrorKind || (exports.EngineErrorKind = {}));
var ParseErrorKind;
(function (ParseErrorKind) {
    ParseErrorKind["EndOfFile"] = "EndOfFile";
})(ParseErrorKind = exports.ParseErrorKind || (exports.ParseErrorKind = {}));
var GraphErrorInfoType;
(function (GraphErrorInfoType) {
    GraphErrorInfoType["Syntax"] = "Syntax";
    GraphErrorInfoType["IncludeNotFound"] = "IncludeNotFound";
    GraphErrorInfoType["NotFound"] = "NotFound";
})(GraphErrorInfoType = exports.GraphErrorInfoType || (exports.GraphErrorInfoType = {}));


/***/ }),

/***/ "../paperclip-utils/lib/exports.js":
/*!*****************************************!*\
  !*** ../paperclip-utils/lib/exports.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../paperclip-utils/lib/graph.js":
/*!***************************************!*\
  !*** ../paperclip-utils/lib/graph.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DependencyContentKind = void 0;
var DependencyContentKind;
(function (DependencyContentKind) {
    DependencyContentKind["Node"] = "Node";
    DependencyContentKind["Stylsheet"] = "Stylesheet";
})(DependencyContentKind = exports.DependencyContentKind || (exports.DependencyContentKind = {}));


/***/ }),

/***/ "../paperclip-utils/lib/index.js":
/*!***************************************!*\
  !*** ../paperclip-utils/lib/index.js ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./events */ "../paperclip-utils/lib/events.js"), exports);
__exportStar(__webpack_require__(/*! ./virt */ "../paperclip-utils/lib/virt.js"), exports);
__exportStar(__webpack_require__(/*! ./ast */ "../paperclip-utils/lib/ast.js"), exports);
__exportStar(__webpack_require__(/*! ./js-ast */ "../paperclip-utils/lib/js-ast.js"), exports);
__exportStar(__webpack_require__(/*! ./js-virt */ "../paperclip-utils/lib/js-virt.js"), exports);
__exportStar(__webpack_require__(/*! ./stringify-sheet */ "../paperclip-utils/lib/stringify-sheet.js"), exports);
__exportStar(__webpack_require__(/*! ./css-ast */ "../paperclip-utils/lib/css-ast.js"), exports);
__exportStar(__webpack_require__(/*! ./base-ast */ "../paperclip-utils/lib/base-ast.js"), exports);
__exportStar(__webpack_require__(/*! ./config */ "../paperclip-utils/lib/config.js"), exports);
__exportStar(__webpack_require__(/*! ./constants */ "../paperclip-utils/lib/constants.js"), exports);
// export * from "./errors";
__exportStar(__webpack_require__(/*! ./graph */ "../paperclip-utils/lib/graph.js"), exports);
__exportStar(__webpack_require__(/*! ./virt-mtuation */ "../paperclip-utils/lib/virt-mtuation.js"), exports);
__exportStar(__webpack_require__(/*! ./resolve */ "../paperclip-utils/lib/resolve.js"), exports);
__exportStar(__webpack_require__(/*! ./stringify-virt-node */ "../paperclip-utils/lib/stringify-virt-node.js"), exports);
__exportStar(__webpack_require__(/*! ./css-virt */ "../paperclip-utils/lib/css-virt.js"), exports);
__exportStar(__webpack_require__(/*! ./virt-patcher */ "../paperclip-utils/lib/virt-patcher.js"), exports);
__exportStar(__webpack_require__(/*! ./exports */ "../paperclip-utils/lib/exports.js"), exports);
__exportStar(__webpack_require__(/*! ./utils */ "../paperclip-utils/lib/utils.js"), exports);
__exportStar(__webpack_require__(/*! ./source-watcher */ "../paperclip-utils/lib/source-watcher.js"), exports);
__exportStar(__webpack_require__(/*! ./memo */ "../paperclip-utils/lib/memo.js"), exports);
__exportStar(__webpack_require__(/*! ./base-virt */ "../paperclip-utils/lib/base-virt.js"), exports);


/***/ }),

/***/ "../paperclip-utils/lib/js-ast.js":
/*!****************************************!*\
  !*** ../paperclip-utils/lib/js-ast.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JsConjunctionOperatorKind = exports.JsExpressionKind = void 0;
var JsExpressionKind;
(function (JsExpressionKind) {
    JsExpressionKind["Node"] = "Node";
    JsExpressionKind["Reference"] = "Reference";
    JsExpressionKind["Array"] = "Array";
    JsExpressionKind["Object"] = "Object";
    JsExpressionKind["String"] = "String";
    JsExpressionKind["Number"] = "Number";
    JsExpressionKind["Boolean"] = "Boolean";
    JsExpressionKind["Conjunction"] = "Conjunction";
    JsExpressionKind["Not"] = "Not";
    JsExpressionKind["Group"] = "Group";
})(JsExpressionKind = exports.JsExpressionKind || (exports.JsExpressionKind = {}));
var JsConjunctionOperatorKind;
(function (JsConjunctionOperatorKind) {
    JsConjunctionOperatorKind["And"] = "And";
    JsConjunctionOperatorKind["Or"] = "Or";
})(JsConjunctionOperatorKind = exports.JsConjunctionOperatorKind || (exports.JsConjunctionOperatorKind = {}));


/***/ }),

/***/ "../paperclip-utils/lib/js-virt.js":
/*!*****************************************!*\
  !*** ../paperclip-utils/lib/js-virt.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeVirtJSValue = exports.toVirtJsValue = exports.computeVirtJSObject = exports.VirtJsObjectKind = void 0;
var memo_1 = __webpack_require__(/*! ./memo */ "../paperclip-utils/lib/memo.js");
var VirtJsObjectKind;
(function (VirtJsObjectKind) {
    VirtJsObjectKind["JsObject"] = "JsObject";
    VirtJsObjectKind["JsArray"] = "JsArray";
    VirtJsObjectKind["JsBoolean"] = "JsBoolean";
    VirtJsObjectKind["JsNumber"] = "JsNumber";
    VirtJsObjectKind["JsString"] = "JsString";
})(VirtJsObjectKind = exports.VirtJsObjectKind || (exports.VirtJsObjectKind = {}));
exports.computeVirtJSObject = memo_1.memoize(function (obj) {
    var values = {};
    for (var key in obj.values) {
        values[key] = exports.computeVirtJSValue(obj.values[key]);
    }
    return values;
});
exports.toVirtJsValue = memo_1.memoize(function (value) {
    if (Array.isArray(value)) {
        return {
            kind: VirtJsObjectKind.JsArray,
            values: value.map(exports.toVirtJsValue)
        };
    }
    else if (value && typeof value === "object") {
        var values = {};
        for (var k in value) {
            values[k] = exports.toVirtJsValue(value[k]);
        }
        return {
            kind: VirtJsObjectKind.JsObject,
            values: values
        };
    }
    else if (typeof value === "number") {
        return {
            kind: VirtJsObjectKind.JsNumber,
            value: value
        };
    }
    else if (typeof value === "string") {
        return {
            kind: VirtJsObjectKind.JsString,
            value: value
        };
    }
    else if (typeof value === "boolean") {
        return {
            kind: VirtJsObjectKind.JsBoolean,
            value: value
        };
    }
});
exports.computeVirtJSValue = memo_1.memoize(function (obj) {
    switch (obj.kind) {
        case VirtJsObjectKind.JsObject: {
            return exports.computeVirtJSObject(obj);
        }
        case VirtJsObjectKind.JsArray: {
            return obj.values.map(exports.computeVirtJSValue);
        }
        case VirtJsObjectKind.JsString:
        case VirtJsObjectKind.JsBoolean:
        case VirtJsObjectKind.JsNumber: {
            return obj.value;
        }
    }
});


/***/ }),

/***/ "../paperclip-utils/lib/memo.js":
/*!**************************************!*\
  !*** ../paperclip-utils/lib/memo.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.underchange = exports.reuser = exports.shallowEquals = exports.memoize = void 0;
var LRU = __webpack_require__(/*! lru-cache */ "../../node_modules/lru-cache/index.js");
var DEFAULT_LRU_MAX = 10000;
// need this for default arguments
var getArgumentCount = function (fn) {
    var str = fn.toString();
    var params = str.match(/\(.*?\)|\w+\s*=>/)[0];
    var args = params
        .replace(/[=>()]/g, "")
        .split(/\s*,\s*/)
        .filter(function (arg) { return arg.substr(0, 3) !== "..."; });
    return args.length;
};
var memoize = function (fn, lruMax, argumentCount) {
    if (lruMax === void 0) { lruMax = DEFAULT_LRU_MAX; }
    if (argumentCount === void 0) { argumentCount = getArgumentCount(fn); }
    if (argumentCount == Infinity || isNaN(argumentCount)) {
        throw new Error("Argument count cannot be Infinity, 0, or NaN.");
    }
    if (!argumentCount) {
        console.error("Argument count should not be 0. Defaulting to 1.");
        argumentCount = 1;
    }
    return compilFastMemoFn(argumentCount, lruMax > 0)(fn, new LRU({ max: lruMax }));
};
exports.memoize = memoize;
var shallowEquals = function (a, b) {
    var toa = typeof a;
    var tob = typeof b;
    if (toa !== tob) {
        return false;
    }
    if (toa !== "object" || !a || !b) {
        return a === b;
    }
    if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
    }
    for (var key in a) {
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
};
exports.shallowEquals = shallowEquals;
var reuser = function (lruMax, getKey, equals) {
    if (lruMax === void 0) { lruMax = DEFAULT_LRU_MAX; }
    if (equals === void 0) { equals = exports.shallowEquals; }
    var cache = new LRU({ max: lruMax });
    return function (value) {
        var key = getKey(value);
        if (!cache.has(key) || !equals(cache.get(key), value)) {
            cache.set(key, value);
        }
        return cache.get(key);
    };
};
exports.reuser = reuser;
var _memoFns = {};
var compilFastMemoFn = function (argumentCount, acceptPrimitives) {
    var hash = "" + argumentCount + acceptPrimitives;
    if (_memoFns[hash]) {
        return _memoFns[hash];
    }
    var args = Array.from({ length: argumentCount }).map(function (v, i) { return "arg" + i; });
    var buffer = "\n  return function(fn, keyMemo) {\n    var memo = new WeakMap();\n    return function(" + args.join(", ") + ") {\n      var currMemo = memo, prevMemo, key;\n  ";
    for (var i = 0, n = args.length - 1; i < n; i++) {
        var arg = args[i];
        buffer += "\n      prevMemo = currMemo;\n      key      = " + arg + ";\n      " + (acceptPrimitives
            ? "if ((typeof key !== \"object\" || !key) && !(key = keyMemo.get(" + arg + "))) {\n        keyMemo.set(" + arg + ", key = {});\n      }"
            : "") + "\n      if (!(currMemo = currMemo.get(key))) {\n        prevMemo.set(key, currMemo = new WeakMap());\n      }\n    ";
    }
    var lastArg = args[args.length - 1];
    buffer += "\n      key = " + lastArg + ";\n      " + (acceptPrimitives
        ? "\n      if ((typeof key !== \"object\" || !key) && !(key = keyMemo.get(" + lastArg + "))) {\n        keyMemo.set(" + lastArg + ", key = {});\n      }"
        : "") + "\n\n      if (!currMemo.has(key)) {\n        try {\n          currMemo.set(key, fn(" + args.join(", ") + "));\n        } catch(e) {\n          throw e;\n        }\n      }\n\n      return currMemo.get(key);\n    };\n  };\n  ";
    return (_memoFns[hash] = new Function(buffer)());
};
/**
 * Calls target function once & proxies passed functions
 * @param fn
 */
var underchange = function (fn) {
    var currentArgs = [];
    var ret;
    var started;
    var start = function () {
        if (started) {
            return ret;
        }
        started = true;
        return (ret = fn.apply(void 0, currentArgs.map(function (a, i) { return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return currentArgs[i].apply(currentArgs, args);
        }; })));
    };
    return (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        currentArgs = args;
        return start();
    });
};
exports.underchange = underchange;


/***/ }),

/***/ "../paperclip-utils/lib/resolve.js":
/*!*****************************************!*\
  !*** ../paperclip-utils/lib/resolve.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.findPCConfigUrl = exports.resolveImportFile = exports.resolveImportUri = void 0;
var path = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
var url = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
var utils_1 = __webpack_require__(/*! ./utils */ "../paperclip-utils/lib/utils.js");
var constants_1 = __webpack_require__(/*! ./constants */ "../paperclip-utils/lib/constants.js");
var resolveImportUri = function (fs) { return function (fromPath, toPath, resolveOutput) {
    var filePath = exports.resolveImportFile(fs)(fromPath, toPath, resolveOutput);
    return filePath;
}; };
exports.resolveImportUri = resolveImportUri;
var resolveImportFile = function (fs) { return function (fromPath, toPath, resolveOutput) {
    try {
        if (/\w+:\/\//.test(toPath)) {
            return toPath;
        }
        if (toPath.charAt(0) !== ".") {
            var uri = resolveModule(fs)(fromPath, toPath, resolveOutput);
            if (!uri) {
                throw new Error("module " + toPath + " not found");
            }
            return uri;
        }
        return url.resolve(fromPath, toPath);
    }
    catch (e) {
        return null;
    }
}; };
exports.resolveImportFile = resolveImportFile;
var readJSONSync = function (fs) { return function (uri) {
    return JSON.parse(fs.readFileSync(uri, "utf8"));
}; };
var resolveModule = function (fs) { return function (fromPath, moduleRelativePath, resolveOutput) {
    var configUrl = exports.findPCConfigUrl(fs)(fromPath);
    if (!configUrl)
        return null;
    var uri = new URL(configUrl);
    // need to parse each time in case config changed.
    var config = readJSONSync(fs)(uri);
    var configPathDir = path.dirname(utils_1.stripFileProtocol(configUrl));
    var moduleFileUrl = url.pathToFileURL(path.normalize(path.join(configPathDir, config.sourceDirectory, moduleRelativePath)));
    // FIRST look for modules in the sourceDirectory
    if (fs.existsSync(moduleFileUrl)) {
        // Need to follow symlinks
        return url.pathToFileURL(fs.realpathSync(moduleFileUrl)).href;
    }
    // No bueno? Move onto the module directories then
    if (config.moduleDirectories) {
        var firstSlashIndex = moduleRelativePath.indexOf("/");
        var moduleName = moduleRelativePath.substr(0, firstSlashIndex);
        var srcPath = moduleRelativePath.substr(firstSlashIndex);
        for (var i = 0, length_1 = config.moduleDirectories.length; i < length_1; i++) {
            var moduleDir = config.moduleDirectories[i];
            var moduleDirectory = path.join(resolveModuleDirectory(fs)(configPathDir, moduleDir), moduleName);
            var modulePath = path.join(moduleDirectory, srcPath);
            var moduleConfigUrl = exports.findPCConfigUrl(fs)(modulePath);
            if (moduleConfigUrl === configUrl) {
                continue;
            }
            if (fs.existsSync(modulePath)) {
                var moduleConfig = readJSONSync(fs)(new URL(moduleConfigUrl));
                var sourceDir = path.join(path.dirname(url.fileURLToPath(moduleConfigUrl)), moduleConfig.sourceDirectory);
                var outputDir = path.join(path.dirname(url.fileURLToPath(moduleConfigUrl)), moduleConfig.outputDirectory || moduleConfig.sourceDirectory);
                var actualPath = resolveOutput
                    ? modulePath.replace(sourceDir, outputDir)
                    : fs.realpathSync(modulePath);
                return url.pathToFileURL(actualPath).href;
            }
        }
    }
    return null;
}; };
var resolveModuleDirectory = function (fs) { return function (cwd, moduleDir) {
    var c0 = moduleDir.charAt(0);
    if (c0 === "/" || c0 === ".") {
        return path.join(cwd, moduleDir);
    }
    var cdir = cwd;
    do {
        var maybeDir = path.join(cdir, moduleDir);
        if (fs.existsSync(maybeDir)) {
            return maybeDir;
        }
        cdir = path.dirname(cdir);
    } while (isntRoot(cdir));
}; };
var findPCConfigUrl = function (fs) { return function (fromUri) {
    var cdir = utils_1.stripFileProtocol(fromUri);
    // can't cache in case PC config was moved.
    do {
        var configUrl = url.pathToFileURL(path.join(cdir, constants_1.PC_CONFIG_FILE_NAME));
        if (fs.existsSync(configUrl)) {
            return configUrl.href;
        }
        cdir = path.dirname(cdir);
    } while (isntRoot(cdir));
    return null;
}; };
exports.findPCConfigUrl = findPCConfigUrl;
var isntRoot = function (cdir) {
    return cdir !== "/" && cdir !== "." && !/^\w+:\\$/.test(cdir);
};


/***/ }),

/***/ "../paperclip-utils/lib/source-watcher.js":
/*!************************************************!*\
  !*** ../paperclip-utils/lib/source-watcher.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaperclipSourceWatcher = exports.ChangeKind = void 0;
var chokidar = __webpack_require__(/*! chokidar */ "chokidar");
var path = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
var url = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
var events_1 = __webpack_require__(/*! events */ "../../node_modules/events/events.js");
var utils_1 = __webpack_require__(/*! ./utils */ "../paperclip-utils/lib/utils.js");
var ChangeKind;
(function (ChangeKind) {
    ChangeKind[ChangeKind["Removed"] = 0] = "Removed";
    ChangeKind[ChangeKind["Added"] = 1] = "Added";
    ChangeKind[ChangeKind["Changed"] = 2] = "Changed";
})(ChangeKind = exports.ChangeKind || (exports.ChangeKind = {}));
var CHOKIDAR_EVENT_MAP = {
    add: ChangeKind.Added,
    unlink: ChangeKind.Removed,
    change: ChangeKind.Changed
};
var PaperclipSourceWatcher = /** @class */ (function () {
    function PaperclipSourceWatcher(config, cwd) {
        this.config = config;
        this.cwd = cwd;
        this._em = new events_1.EventEmitter();
        this._init();
    }
    PaperclipSourceWatcher.prototype.onChange = function (listener) {
        var _this = this;
        this._em.on("change", listener);
        return function () { return _this._em.off("change", listener); };
    };
    PaperclipSourceWatcher.prototype.dispose = function () {
        this._watcher.close();
    };
    PaperclipSourceWatcher.prototype._init = function () {
        var _this = this;
        var watcher = (this._watcher = chokidar.watch(utils_1.paperclipSourceGlobPattern(this.config.sourceDirectory), { cwd: this.cwd, ignoreInitial: true }));
        watcher.on("all", function (eventName, relativePath) {
            var filePath = relativePath.charAt(0) !== "/"
                ? path.join(_this.cwd, relativePath)
                : relativePath;
            var changeKind = CHOKIDAR_EVENT_MAP[eventName];
            if (changeKind) {
                _this._em.emit("change", changeKind, url.pathToFileURL(filePath).href);
            }
        });
    };
    return PaperclipSourceWatcher;
}());
exports.PaperclipSourceWatcher = PaperclipSourceWatcher;


/***/ }),

/***/ "../paperclip-utils/lib/stringify-sheet.js":
/*!*************************************************!*\
  !*** ../paperclip-utils/lib/stringify-sheet.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.stringifyCSSSheet = void 0;
var path = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
var url = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
var stringifyCSSSheet = function (sheet, options) {
    if (options === void 0) { options = {}; }
    return sheet.rules.map(function (rule) { return stringifyCSSRule(rule, options); }).join("\n");
};
exports.stringifyCSSSheet = stringifyCSSSheet;
var stringifyCSSRule = function (rule, options) {
    switch (rule.kind) {
        case "Style":
            return stringifyStyleRule(rule, options);
        case "Page":
        case "Supports":
        case "Media":
            return stringifyConditionRule(rule, options);
        case "FontFace":
            return stringifyFontFaceRule(rule, options);
        case "Keyframes":
            return stringifyKeyframesRule(rule, options);
    }
};
var stringifyConditionRule = function (_a, options) {
    var name = _a.name, condition_text = _a.condition_text, rules = _a.rules;
    return "@" + name + " " + condition_text + " {\n    " + rules.map(function (style) { return stringifyStyleRule(style, options); }).join("\n") + "\n  }";
};
var stringifyKeyframesRule = function (_a, options) {
    var name = _a.name, rules = _a.rules;
    return "@keyframes " + name + " {\n    " + rules.map(function (style) { return stringifyKeyframeRule(style, options); }).join("\n") + "\n  }";
};
var stringifyKeyframeRule = function (_a, options) {
    var key = _a.key, style = _a.style;
    return key + " {\n    " + style.map(function (style) { return stringifyStyle(style, options); }).join("\n") + "\n  }";
};
var stringifyFontFaceRule = function (_a, options) {
    var style = _a.style;
    return "@font-face {\n    " + style.map(function (style) { return stringifyStyle(style, options); }).join("\n") + "\n  }";
};
var stringifyStyleRule = function (_a, options) {
    var selector_text = _a.selector_text, style = _a.style;
    return selector_text + " {\n    " + style.map(function (style) { return stringifyStyle(style, options); }).join("\n") + "\n  }";
};
var stringifyStyle = function (_a, _b) {
    var name = _a.name, value = _a.value;
    var uri = _b.uri, resolveUrl = _b.resolveUrl;
    if (value) {
        // required for bundling, otherwise file protocol is maintained
        if (uri) {
            var urls = value.match(/(file:\/\/.*?)(?=['")])/g) || [];
            var selfPathname = url.fileURLToPath(uri);
            for (var _i = 0, urls_1 = urls; _i < urls_1.length; _i++) {
                var foundUrl = urls_1[_i];
                var pathname = url.fileURLToPath(foundUrl);
                var relativePath = path.relative(path.dirname(selfPathname), pathname);
                if (relativePath.charAt(0) !== ".") {
                    relativePath = "./" + relativePath;
                }
                value = value.replace(foundUrl, relativePath);
            }
        }
        if (value && value.includes("file:") && resolveUrl) {
            var url_1 = value.match(/(file:\/\/[^)]+)/)[1];
            value = value.replace(url_1, resolveUrl(url_1));
        }
    }
    return name + ":" + value + ";";
};


/***/ }),

/***/ "../paperclip-utils/lib/stringify-virt-node.js":
/*!*****************************************************!*\
  !*** ../paperclip-utils/lib/stringify-virt-node.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.stringifyVirtualNode = void 0;
var stringify_sheet_1 = __webpack_require__(/*! ./stringify-sheet */ "../paperclip-utils/lib/stringify-sheet.js");
var html_entities_1 = __webpack_require__(/*! html-entities */ "../../node_modules/html-entities/lib/index.js");
var entities = new html_entities_1.Html5Entities();
var stringifyVirtualNode = function (node) {
    switch (node.kind) {
        case "Fragment":
            return stringifyChildren(node);
        case "Element": {
            var buffer = "<" + node.tagName;
            for (var key in node.attributes) {
                var value = node.attributes[key];
                if (value) {
                    buffer += " " + key + "=\"" + value + "\"";
                }
                else {
                    buffer += " " + key;
                }
            }
            buffer += ">" + stringifyChildren(node) + "</" + node.tagName + ">";
            return buffer;
        }
        case "StyleElement": {
            return "<style>" + stringify_sheet_1.stringifyCSSSheet(node.sheet) + "</style>";
        }
        case "Text": {
            return entities.decode(node.value);
        }
        default: {
            throw new Error("can't handle " + node.kind);
        }
    }
};
exports.stringifyVirtualNode = stringifyVirtualNode;
var stringifyChildren = function (node) {
    return node.children.map(exports.stringifyVirtualNode).join("");
};


/***/ }),

/***/ "../paperclip-utils/lib/utils.js":
/*!***************************************!*\
  !*** ../paperclip-utils/lib/utils.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isPaperclipFile = exports.paperclipSourceGlobPattern = exports.stripFileProtocol = void 0;
var url = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
var stripFileProtocol = function (filePath) {
    return filePath.includes("file://") ? url.fileURLToPath(filePath) : filePath;
};
exports.stripFileProtocol = stripFileProtocol;
var paperclipSourceGlobPattern = function (dir) {
    return dir === "." ? "**/*.pc" : dir + "/**/*.pc";
};
exports.paperclipSourceGlobPattern = paperclipSourceGlobPattern;
var isPaperclipFile = function (filePath) { return /\.pc$/.test(filePath); };
exports.isPaperclipFile = isPaperclipFile;


/***/ }),

/***/ "../paperclip-utils/lib/virt-mtuation.js":
/*!***********************************************!*\
  !*** ../paperclip-utils/lib/virt-mtuation.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ActionKind = void 0;
var ActionKind;
(function (ActionKind) {
    ActionKind["ReplaceNode"] = "ReplaceNode";
    ActionKind["InsertChild"] = "InsertChild";
    ActionKind["DeleteChild"] = "DeleteChild";
    ActionKind["SetAttribute"] = "SetAttribute";
    ActionKind["SetAnnotations"] = "SetAnnotations";
    ActionKind["SourceChanged"] = "SourceChanged";
    ActionKind["SourceUriChanged"] = "SourceUriChanged";
    ActionKind["SetText"] = "SetText";
    ActionKind["RemoveAttribute"] = "RemoveAttribute";
})(ActionKind = exports.ActionKind || (exports.ActionKind = {}));


/***/ }),

/***/ "../paperclip-utils/lib/virt-patcher.js":
/*!**********************************************!*\
  !*** ../paperclip-utils/lib/virt-patcher.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateAllLoadedData = exports.getVirtTarget = exports.patchVirtNode = void 0;
var virt_mtuation_1 = __webpack_require__(/*! ./virt-mtuation */ "../paperclip-utils/lib/virt-mtuation.js");
var virt_1 = __webpack_require__(/*! ./virt */ "../paperclip-utils/lib/virt.js");
var events_1 = __webpack_require__(/*! ./events */ "../paperclip-utils/lib/events.js");
var patchVirtNode = function (root, mutations) {
    for (var _i = 0, mutations_1 = mutations; _i < mutations_1.length; _i++) {
        var mutation = mutations_1[_i];
        var target = exports.getVirtTarget(root, mutation.nodePath);
        var action = mutation.action;
        switch (action.kind) {
            case virt_mtuation_1.ActionKind.DeleteChild: {
                var element = target;
                var children = element.children.concat();
                children.splice(action.index, 1);
                target = __assign(__assign({}, target), { children: children });
                break;
            }
            case virt_mtuation_1.ActionKind.InsertChild: {
                var element = target;
                var children = element.children.concat();
                children.splice(action.index, 0, action.child);
                target = __assign(__assign({}, target), { children: children });
                break;
            }
            case virt_mtuation_1.ActionKind.ReplaceNode: {
                target = action.replacement;
                break;
            }
            case virt_mtuation_1.ActionKind.RemoveAttribute: {
                var element = target;
                var attributes = __assign({}, element.attributes);
                attributes[action.name] = undefined;
                target = __assign(__assign({}, target), { attributes: attributes });
                break;
            }
            case virt_mtuation_1.ActionKind.SetAttribute: {
                var element = target;
                var attributes = __assign({}, element.attributes);
                attributes[action.name] = action.value;
                target = __assign(__assign({}, target), { attributes: attributes });
                break;
            }
            case virt_mtuation_1.ActionKind.SetAnnotations: {
                target = __assign(__assign({}, target), { annotations: action.value });
                break;
            }
            case virt_mtuation_1.ActionKind.SetText: {
                target = __assign(__assign({}, target), { value: action.value });
                break;
            }
            case virt_mtuation_1.ActionKind.SourceChanged: {
                target = __assign(__assign({}, target), { source: action.newSource });
                break;
            }
        }
        root = updateNode(root, mutation.nodePath, target);
    }
    return root;
};
exports.patchVirtNode = patchVirtNode;
var getVirtTarget = function (mount, nodePath) {
    return nodePath.reduce(function (current, i) {
        var c = current.children[i];
        return c;
    }, mount);
};
exports.getVirtTarget = getVirtTarget;
var updateNode = function (ancestor, nodePath, newNode, depth) {
    if (depth === void 0) { depth = 0; }
    if (depth === nodePath.length) {
        return newNode;
    }
    if (ancestor.kind === virt_1.VirtualNodeKind.Text ||
        ancestor.kind === virt_1.VirtualNodeKind.StyleElement) {
        return newNode;
    }
    return __assign(__assign({}, ancestor), { children: __spreadArrays(ancestor.children.slice(0, nodePath[depth]), [
            updateNode(ancestor.children[nodePath[depth]], nodePath, newNode, depth + 1)
        ], ancestor.children.slice(nodePath[depth] + 1)) });
};
var updateAllLoadedData = function (allData, event) {
    var _a, _b;
    if (event.kind === events_1.EngineDelegateEventKind.Evaluated) {
        return __assign(__assign({}, allData), (_a = {}, _a[event.uri] = __assign(__assign({}, event.data), { importedSheets: getImportedSheets(allData, event) }), _a));
    }
    else if (event.kind === events_1.EngineDelegateEventKind.Diffed) {
        var existingData = allData[event.uri];
        // this will happen if client renderer loads data, but imported
        // resource has changed
        if (!existingData) {
            return allData;
        }
        return __assign(__assign({}, allData), (_b = {}, _b[event.uri] = __assign(__assign({}, existingData), { imports: event.data.imports, exports: event.data.exports, importedSheets: getImportedSheets(allData, event), allDependencies: event.data.allDependencies, sheet: event.data.sheet || existingData.sheet, preview: exports.patchVirtNode(existingData.preview, event.data.mutations) }), _b));
    }
    return allData;
};
exports.updateAllLoadedData = updateAllLoadedData;
var getImportedSheets = function (allData, _a) {
    // ick, wworks for now.
    var allDependencies = _a.data.allDependencies;
    var deps = [];
    for (var _i = 0, allDependencies_1 = allDependencies; _i < allDependencies_1.length; _i++) {
        var depUri = allDependencies_1[_i];
        var data = allData[depUri];
        if (data) {
            deps.push({ uri: depUri, sheet: data.sheet });
            // scenario won't happen for renderer since renderers are only
            // concerned about the file that's currently opened -- ignore for now. Might
        }
        else {
            // console.error(`data not loaded, this shouldn't happen 😬.`);
        }
    }
    return deps;
};


/***/ }),

/***/ "../paperclip-utils/lib/virt.js":
/*!**************************************!*\
  !*** ../paperclip-utils/lib/virt.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VirtualNodeKind = void 0;
var VirtualNodeKind;
(function (VirtualNodeKind) {
    VirtualNodeKind["Element"] = "Element";
    VirtualNodeKind["Text"] = "Text";
    VirtualNodeKind["Fragment"] = "Fragment";
    VirtualNodeKind["StyleElement"] = "StyleElement";
})(VirtualNodeKind = exports.VirtualNodeKind || (exports.VirtualNodeKind = {}));


/***/ }),

/***/ "../paperclip/browser.js":
/*!*******************************!*\
  !*** ../paperclip/browser.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "loadEngineDelegate": () => /* binding */ loadEngineDelegate
/* harmony export */ });
/* harmony import */ var _esm_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./esm/core */ "../paperclip/esm/core/index.js");


const loadEngineDelegate = async (options, onCrash) => {
  // need this here since webpack tree shakes it out
  await __webpack_require__.e(/*! import() */ "paperclip_native_browser_paperclip_bg_js").then(__webpack_require__.bind(__webpack_require__, /*! ./native/browser/paperclip_bg.wasm */ "../paperclip/native/browser/paperclip_bg.wasm"));

  const { NativeEngine } = await __webpack_require__.e(/*! import() */ "paperclip_native_browser_paperclip_bg_js").then(__webpack_require__.bind(__webpack_require__, /*! ./native/browser/paperclip_bg */ "../paperclip/native/browser/paperclip_bg.js"));
  const { readFile, fileExists, resolveFile } = options.io;

  return new _esm_core__WEBPACK_IMPORTED_MODULE_0__.EngineDelegate(
    NativeEngine.new(
      readFile,
      fileExists,
      resolveFile,
      options.mode || _esm_core__WEBPACK_IMPORTED_MODULE_0__.EngineMode.MultiFrame
    ),
    onCrash ||
      function(e) {
        console.error(e);
      }
  );
};


/***/ }),

/***/ "../paperclip/esm/core/delegate.js":
/*!*****************************************!*\
  !*** ../paperclip/esm/core/delegate.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EngineMode": () => /* binding */ EngineMode,
/* harmony export */   "EngineDelegateEventType": () => /* binding */ EngineDelegateEventType,
/* harmony export */   "EngineDelegate": () => /* binding */ EngineDelegate,
/* harmony export */   "keepEngineInSyncWithFileSystem2": () => /* binding */ keepEngineInSyncWithFileSystem2
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "chokidar");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! paperclip-utils */ "../paperclip-utils/index.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(paperclip_utils__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "../paperclip/esm/core/utils.js");
// 🙈




var EngineMode;
(function (EngineMode) {
    EngineMode[EngineMode["SingleFrame"] = 0] = "SingleFrame";
    EngineMode[EngineMode["MultiFrame"] = 1] = "MultiFrame";
})(EngineMode || (EngineMode = {}));
const mapResult = result => {
    if (!result) {
        return result;
    }
    if (result.Ok) {
        return result.Ok;
    }
    else {
        return { error: result.Err };
    }
};
var EngineDelegateEventType;
(function (EngineDelegateEventType) {
    EngineDelegateEventType["Loaded"] = "Loaded";
    EngineDelegateEventType["ChangedSheets"] = "ChangedSheets";
})(EngineDelegateEventType || (EngineDelegateEventType = {}));
/*
Engine delegate is the bridge between JS and the rust engine. Primary reason
for this class instead of shoving functionality into the engine itself is for performance &
reducing amount of data being passed between Rust <-> JS
*/
class EngineDelegate {
    constructor(_native, _onCrash = _utils__WEBPACK_IMPORTED_MODULE_3__.noop) {
        this._native = _native;
        this._onCrash = _onCrash;
        this._listeners = [];
        this._rendered = {};
        this._documents = {};
        this._onEngineDelegateEvent = (event) => {
            if (event.kind === paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.EngineDelegateEventKind.Deleted) {
                delete this._rendered[event.uri];
            }
            else if (event.kind === paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.EngineDelegateEventKind.Evaluated) {
                this._rendered = (0,paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.updateAllLoadedData)(this._rendered, event);
                this._dispatch({
                    kind: paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.EngineDelegateEventKind.Loaded,
                    uri: event.uri,
                    data: this._rendered[event.uri]
                });
            }
            else if (event.kind === paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.EngineDelegateEventKind.Diffed) {
                const existingData = this._rendered[event.uri];
                this._rendered = (0,paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.updateAllLoadedData)(this._rendered, event);
                const newData = this._rendered[event.uri];
                const removedSheetUris = [];
                for (const { uri } of existingData.importedSheets) {
                    if (!newData.allDependencies.includes(uri)) {
                        removedSheetUris.push(uri);
                    }
                }
                const addedSheets = [];
                for (const depUri of event.data.allDependencies) {
                    // Note that we only do this if the sheet is already rendered -- engine
                    // doesn't fire an event in that scenario. So we need to notify any listener that a sheet
                    // has been added, including the actual sheet object.
                    if (!existingData.allDependencies.includes(depUri) &&
                        this._rendered[depUri]) {
                        addedSheets.push({
                            uri: depUri,
                            sheet: this._rendered[depUri].sheet
                        });
                    }
                }
                if (addedSheets.length || removedSheetUris.length) {
                    this._dispatch({
                        uri: event.uri,
                        kind: paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.EngineDelegateEventKind.ChangedSheets,
                        data: {
                            newSheets: addedSheets,
                            removedSheetUris: removedSheetUris,
                            allDependencies: event.data.allDependencies
                        }
                    });
                }
            }
        };
        this._tryCatch = (fn) => {
            try {
                return fn();
            }
            catch (e) {
                this._onCrash(e);
                return null;
            }
        };
        this._dispatch = (event) => {
            // try-catch since engine will throw opaque error.
            for (const listener of this._listeners) {
                listener(event);
            }
        };
        // only one native listener to for buffer performance
        this._native.add_listener(this._dispatch);
        this.onEvent(this._onEngineDelegateEvent);
        return this;
    }
    onEvent(listener) {
        if (listener == null) {
            throw new Error(`listener cannot be undefined`);
        }
        this._listeners.push(listener);
        return () => {
            const i = this._listeners.indexOf(listener);
            if (i !== -1) {
                this._listeners.splice(i, 1);
            }
        };
    }
    parseFile(uri) {
        return mapResult(this._native.parse_file(uri));
    }
    getLoadedAst(uri) {
        return this._tryCatch(() => this._native.get_loaded_ast(uri));
    }
    parseContent(content) {
        return this._tryCatch(() => mapResult(this._native.parse_content(content)));
    }
    purgeUnlinkedFiles() {
        return this._tryCatch(() => {
            const ret = mapResult(this._native.purge_unlinked_files());
            return ret;
        });
    }
    getVirtualContent(uri) {
        return this._documents[uri];
    }
    updateVirtualFileContent(uri, content) {
        this._documents[uri] = content;
        return this._tryCatch(() => {
            const ret = mapResult(this._native.update_virtual_file_content(uri, content));
            return ret;
        });
    }
    getLoadedData(uri) {
        return this._rendered[uri];
    }
    getAllLoadedData() {
        return this._rendered;
    }
    open(uri) {
        const result = this._tryCatch(() => mapResult(this._native.run(uri)));
        if (result && result.error) {
            throw result.error;
        }
        return this._rendered[uri];
    }
}
const keepEngineInSyncWithFileSystem2 = (watcher, engine) => {
    return watcher.onChange((kind, uri) => {
        if (kind === paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.ChangeKind.Changed) {
            engine.updateVirtualFileContent(uri, fs__WEBPACK_IMPORTED_MODULE_0__.readFileSync(new url__WEBPACK_IMPORTED_MODULE_1__.URL(uri), "utf8"));
        }
        else if (kind === paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.ChangeKind.Removed) {
            engine.purgeUnlinkedFiles();
        }
    });
};


/***/ }),

/***/ "../paperclip/esm/core/index.js":
/*!**************************************!*\
  !*** ../paperclip/esm/core/index.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "InferenceKind": () => /* reexport safe */ _infer__WEBPACK_IMPORTED_MODULE_0__.InferenceKind,
/* harmony export */   "infer": () => /* reexport safe */ _infer__WEBPACK_IMPORTED_MODULE_0__.infer,
/* harmony export */   "noop": () => /* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_2__.noop,
/* harmony export */   "resolveAllAssetFiles": () => /* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_2__.resolveAllAssetFiles,
/* harmony export */   "resolveAllPaperclipFiles": () => /* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_2__.resolveAllPaperclipFiles,
/* harmony export */   "EngineDelegate": () => /* reexport safe */ _delegate__WEBPACK_IMPORTED_MODULE_3__.EngineDelegate,
/* harmony export */   "EngineMode": () => /* reexport safe */ _delegate__WEBPACK_IMPORTED_MODULE_3__.EngineMode,
/* harmony export */   "keepEngineInSyncWithFileSystem2": () => /* reexport safe */ _delegate__WEBPACK_IMPORTED_MODULE_3__.keepEngineInSyncWithFileSystem2
/* harmony export */ });
/* harmony import */ var _infer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./infer */ "../paperclip/esm/core/infer.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! paperclip-utils */ "../paperclip-utils/index.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(paperclip_utils__WEBPACK_IMPORTED_MODULE_1__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in paperclip_utils__WEBPACK_IMPORTED_MODULE_1__) if(["default","EngineDelegate","EngineMode","keepEngineInSyncWithFileSystem2","InferenceKind","infer"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => paperclip_utils__WEBPACK_IMPORTED_MODULE_1__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "../paperclip/esm/core/utils.js");
/* harmony import */ var _delegate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./delegate */ "../paperclip/esm/core/delegate.js");






/***/ }),

/***/ "../paperclip/esm/core/infer.js":
/*!**************************************!*\
  !*** ../paperclip/esm/core/infer.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "InferenceKind": () => /* binding */ InferenceKind,
/* harmony export */   "infer": () => /* binding */ infer
/* harmony export */ });
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! paperclip-utils */ "../paperclip-utils/index.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(paperclip_utils__WEBPACK_IMPORTED_MODULE_0__);

// TODO - this should be built in rust
var InferenceKind;
(function (InferenceKind) {
    InferenceKind[InferenceKind["Shape"] = 0] = "Shape";
    InferenceKind[InferenceKind["Array"] = 1] = "Array";
    InferenceKind[InferenceKind["Any"] = 2] = "Any";
})(InferenceKind || (InferenceKind = {}));
const createShapeInference = (properties = {}, fromSpread = false) => ({ kind: InferenceKind.Shape, fromSpread, properties });
const createAnyInference = () => ({ kind: InferenceKind.Any });
const ANY_INFERENCE = createAnyInference();
const SPREADED_SHAPE_INFERENCE = createShapeInference({}, true);
const addShapeInferenceProperty = (part, value, shape) => {
    var _a, _b;
    return (Object.assign(Object.assign({}, shape), { properties: Object.assign(Object.assign({}, shape.properties), { [part.name]: {
                value,
                optional: ((_a = shape.properties[part.name]) === null || _a === void 0 ? void 0 : _a.optional) === false
                    ? (_b = shape.properties[part.name]) === null || _b === void 0 ? void 0 : _b.optional : part.optional
            } }) }));
};
const mergeShapeInference = (existing, extended) => {
    if (extended.kind === InferenceKind.Any) {
        return existing;
    }
    if (extended.kind === InferenceKind.Array) {
        console.error(`Conflict: can't access properties of arra`);
        // ERRROR!
        return existing;
    }
    return Object.assign(Object.assign({}, existing), { properties: Object.assign(Object.assign({}, existing.properties), extended.properties) });
};
const addInferenceProperty = (path, value, owner, _index = 0) => {
    var _a, _b;
    if (path.length === 0) {
        return owner;
    }
    if (owner.kind === InferenceKind.Any) {
        owner = createShapeInference();
    }
    const part = path[_index];
    if (owner.kind === InferenceKind.Shape) {
        if (_index < path.length - 1) {
            let childValue = ((_a = owner.properties[part.name]) === null || _a === void 0 ? void 0 : _a.value) || createShapeInference();
            childValue = addInferenceProperty(path, value, childValue, _index + 1);
            owner = addShapeInferenceProperty(part, childValue, owner);
        }
        else {
            const existingInference = ((_b = owner.properties[part.name]) === null || _b === void 0 ? void 0 : _b.value) || ANY_INFERENCE;
            if (existingInference.kind === InferenceKind.Shape) {
                value = mergeShapeInference(existingInference, value);
            }
            owner = addShapeInferenceProperty(part, value, owner);
        }
    }
    if (owner.kind === InferenceKind.Array) {
        owner = Object.assign(Object.assign({}, owner), { value: addInferenceProperty(path, value, owner.value, _index) });
    }
    return owner;
};
const unfurlScopePath = (path, context) => {
    let cpath = path;
    if (!context.scope[path[0].name]) {
        return path;
    }
    let entirePath = path;
    while (true) {
        const property = cpath[0].name;
        const newCPath = context.scope[property];
        // if exists, but empty, then the scope is created within the template
        if (newCPath) {
            if (newCPath.length === 0) {
                return [];
            }
        }
        else {
            break;
        }
        entirePath = [...newCPath, ...entirePath.slice(1)];
        cpath = newCPath;
    }
    return entirePath;
};
const addContextInferenceProperty = (path, value, context) => (Object.assign(Object.assign({}, context), { inference: addInferenceProperty(unfurlScopePath(path, context), value, context.inference) }));
const infer = (ast) => {
    return inferNode(ast, true, {
        scope: {},
        inference: createShapeInference()
    }).inference;
};
const inferNode = (ast, isRoot, context) => {
    switch (ast.kind) {
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.NodeKind.Element:
            return inferElement(ast, isRoot, context);
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.NodeKind.Slot:
            return inferSlot(ast, context);
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.NodeKind.Fragment:
            return inferFragment(ast, context);
    }
    return context;
};
const inferElement = (element, isRoot, context) => {
    for (const atttribute of element.attributes) {
        context = inferAttribute(atttribute, context);
    }
    context = inferChildren(element.children, context);
    return context;
};
const inferAttribute = (attribute, context) => {
    switch (attribute.kind) {
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.AttributeKind.KeyValueAttribute: {
            if (attribute.value &&
                attribute.value.attrValueKind === paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.AttributeValueKind.Slot) {
                context = inferJsExpression(attribute.value.script, context);
            }
            if (attribute.value &&
                attribute.value.attrValueKind === paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.AttributeValueKind.DyanmicString) {
                for (const part of attribute.value.values) {
                    if (part.partKind === paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.DynamicStringAttributeValuePartKind.Slot) {
                        context = inferJsExpression(part, context);
                    }
                }
            }
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.AttributeKind.PropertyBoundAttribute: {
            context = addContextInferenceProperty([{ name: attribute.bindingName, optional: true }], ANY_INFERENCE, context);
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.AttributeKind.ShorthandAttribute: {
            context = inferJsExpression(attribute.reference, context);
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.AttributeKind.SpreadAttribute: {
            context = inferJsExpression(attribute.script, context, SPREADED_SHAPE_INFERENCE);
            break;
        }
    }
    return context;
};
const inferSlot = (slot, context) => {
    return inferJsExpression(slot.script, context);
};
const inferFragment = (fragment, context) => {
    return inferChildren(fragment.children, context);
};
const inferChildren = (children, context) => children.reduce((context, child) => inferNode(child, false, context), context);
const inferJsExpression = (expression, context, defaultInference = ANY_INFERENCE) => {
    switch (expression.jsKind) {
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.JsExpressionKind.Reference: {
            context = addContextInferenceProperty(expression.path, defaultInference, context);
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.JsExpressionKind.Node: {
            context = inferNode(expression, false, context);
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.JsExpressionKind.Object: {
            for (const property of expression.properties) {
                context = inferJsExpression(property.value, context, defaultInference);
            }
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.JsExpressionKind.Array: {
            for (const value of expression.values) {
                context = inferJsExpression(value, context, defaultInference);
            }
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.JsExpressionKind.Conjunction: {
            context = inferJsExpression(expression.left, context, defaultInference);
            context = inferJsExpression(expression.right, context, defaultInference);
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.JsExpressionKind.Not: {
            context = inferJsExpression(expression.expression, context, defaultInference);
            break;
        }
    }
    return context;
};


/***/ }),

/***/ "../paperclip/esm/core/utils.js":
/*!**************************************!*\
  !*** ../paperclip/esm/core/utils.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "resolveAllPaperclipFiles": () => /* binding */ resolveAllPaperclipFiles,
/* harmony export */   "resolveAllAssetFiles": () => /* binding */ resolveAllAssetFiles,
/* harmony export */   "noop": () => /* binding */ noop
/* harmony export */ });
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! paperclip-utils */ "../paperclip-utils/index.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(paperclip_utils__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! fs */ "chokidar");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_3__);




// TODO - move to paperclip-utils as soon as we have a glob library that can handle virtual file systems
const findResourcesFromConfig = (get) => fs => (fromUri, relative) => {
    // symlinks may fudge module resolution, so we need to find the real path
    const fromPath = fs.realpathSync(new url__WEBPACK_IMPORTED_MODULE_1__.URL(fromUri));
    const fromPathDirname = path__WEBPACK_IMPORTED_MODULE_0__.dirname(fromPath);
    const configUrl = (0,paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.findPCConfigUrl)(fs)(fromUri);
    // If there's no config, then don't bother looking for PC files. Otherwise we're likely
    // to need esoteric logic for resolving PC that I don't think should be supported -- there should
    // just be aproach.
    if (!configUrl) {
        return [];
    }
    const configUri = new url__WEBPACK_IMPORTED_MODULE_1__.URL(configUrl);
    const config = JSON.parse(fs.readFileSync(configUri, "utf8"));
    return get(config, path__WEBPACK_IMPORTED_MODULE_0__.dirname(url__WEBPACK_IMPORTED_MODULE_1__.fileURLToPath(configUri)))
        .filter(pathname => pathname !== fromPath)
        .map(pathname => {
        if (relative) {
            const modulePath = getModulePath(configUrl, config, pathname, fromPathDirname);
            if (!path__WEBPACK_IMPORTED_MODULE_0__.isAbsolute(modulePath)) {
                return modulePath;
            }
            let relativePath = path__WEBPACK_IMPORTED_MODULE_0__.relative(fromPathDirname, modulePath);
            if (relativePath.charAt(0) !== ".") {
                relativePath = "./" + relativePath;
            }
            return relativePath;
        }
        return url__WEBPACK_IMPORTED_MODULE_1__.pathToFileURL(pathname).href;
    })
        .map(filePath => {
        return filePath.replace(/\\/g, "/");
    });
};
const resolveModuleRoots = (fromDir, roots = []) => {
    const stat = fs__WEBPACK_IMPORTED_MODULE_3__.lstatSync(fromDir);
    const realpath = stat.isSymbolicLink() ? fs__WEBPACK_IMPORTED_MODULE_3__.realpathSync(fromDir) : fromDir;
    const newStat = realpath === fromDir ? stat : fs__WEBPACK_IMPORTED_MODULE_3__.lstatSync(realpath);
    if (!newStat.isDirectory()) {
        return roots;
    }
    if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(path__WEBPACK_IMPORTED_MODULE_0__.join(fromDir, "package.json"))) {
        roots.push(fromDir);
    }
    else {
        for (const dirname of fs__WEBPACK_IMPORTED_MODULE_3__.readdirSync(realpath)) {
            resolveModuleRoots(path__WEBPACK_IMPORTED_MODULE_0__.join(fromDir, dirname), roots);
        }
    }
    return roots;
};
const filterAllFiles = (filter) => {
    const scan = (currentPath, results = []) => {
        const stat = fs__WEBPACK_IMPORTED_MODULE_3__.lstatSync(currentPath);
        const realpath = stat.isSymbolicLink()
            ? fs__WEBPACK_IMPORTED_MODULE_3__.realpathSync(currentPath)
            : currentPath;
        const newStat = realpath === currentPath ? stat : fs__WEBPACK_IMPORTED_MODULE_3__.lstatSync(realpath);
        if (newStat.isDirectory()) {
            for (const dirname of fs__WEBPACK_IMPORTED_MODULE_3__.readdirSync(realpath)) {
                const dirpath = path__WEBPACK_IMPORTED_MODULE_0__.join(currentPath, dirname);
                scan(dirpath, results);
            }
        }
        else {
            if (filter(currentPath)) {
                results.push(currentPath);
            }
        }
        return results;
    };
    return scan;
};
const resolveResources = (config, cwd, filterFiles) => {
    const sourceDir = config.sourceDirectory === "."
        ? cwd
        : path__WEBPACK_IMPORTED_MODULE_0__.join(cwd, config.sourceDirectory);
    const filePaths = filterFiles(sourceDir);
    if (config.moduleDirectories) {
        for (const modulesDirname of config.moduleDirectories) {
            const moduleDirPath = path__WEBPACK_IMPORTED_MODULE_0__.join(cwd, modulesDirname);
            const moduleRoots = resolveModuleRoots(moduleDirPath);
            for (const moduleDir of moduleRoots) {
                // need to scan until there's a package. This covers @organization namespaces.
                if (!moduleDir) {
                    continue;
                }
                const pcConfigPath = path__WEBPACK_IMPORTED_MODULE_0__.join(moduleDir, paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.PC_CONFIG_FILE_NAME);
                if (!fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(pcConfigPath)) {
                    continue;
                }
                const moduleConfig = JSON.parse(fs__WEBPACK_IMPORTED_MODULE_3__.readFileSync(pcConfigPath, "utf8"));
                const moduleSources = filterFiles(path__WEBPACK_IMPORTED_MODULE_0__.join(moduleDir, moduleConfig.sourceDirectory));
                filePaths.push(...moduleSources);
            }
        }
    }
    return filePaths;
};
const resolveAllPaperclipFiles = findResourcesFromConfig((config, cwd) => {
    return resolveResources(config, cwd, filterAllFiles(filePath => path__WEBPACK_IMPORTED_MODULE_0__.extname(filePath) === ".pc"));
});
const resolveAllAssetFiles = findResourcesFromConfig((config, cwd) => {
    // const ext = `+(jpg|jpeg|png|gif|svg)`;
    const exts = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".ttf"];
    // const sourceDir = config.sourceDirectory;
    return resolveResources(config, cwd, filterAllFiles(filePath => exts.includes(path__WEBPACK_IMPORTED_MODULE_0__.extname(filePath))));
    // if (sourceDir === ".") {
    //   return filterAllFiles(filePath => exts.includes(path.extname(filePath)))(cwd);
    //   // return glob.sync(`**/*.${ext}`, { cwd, realpath: true });
    // }
    // // return glob.sync(`${sourceDir}/**/*.${ext}`, { cwd, realpath: true });
    // return filterAllFiles(filePath => exts.includes(path.extname(filePath)))(path.join(cwd, sourceDir));
});
const getModulePath = (configUri, config, fullPath, fromDir) => {
    var _a;
    const configDir = path__WEBPACK_IMPORTED_MODULE_0__.dirname(url__WEBPACK_IMPORTED_MODULE_1__.fileURLToPath(configUri));
    const moduleDirectory = path__WEBPACK_IMPORTED_MODULE_0__.join(configDir, config.sourceDirectory) + "/";
    if (fullPath.indexOf(moduleDirectory) === 0) {
        const modulePath = fullPath.replace(moduleDirectory, "");
        const relativePath = fromDir && path__WEBPACK_IMPORTED_MODULE_0__.relative(fromDir, fullPath);
        if (((_a = relativePath === null || relativePath === void 0 ? void 0 : relativePath.match(/\.\.\//g)) === null || _a === void 0 ? void 0 : _a.length) || 0 > 0) {
            return modulePath;
        }
    }
    if (config.moduleDirectories) {
        for (const moduleDirectory of config.moduleDirectories) {
            const fullModulePath = path__WEBPACK_IMPORTED_MODULE_0__.join(configDir, moduleDirectory);
            if (fullPath.indexOf(fullModulePath) === 0) {
                return fullPath.replace(fullModulePath, "").substr(1);
            }
        }
    }
    return fullPath;
};
// eslint-disable-next-line
const noop = () => { };


/***/ }),

/***/ "chokidar":
/*!*********************!*\
  !*** external "{}" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = {};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get mini-css chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.miniCssF = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".css";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.hmd = (module) => {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: () => {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"src_frontend_sagas_engine-worker_ts": 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var chunkLoadingCallback = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				importScripts("" + __webpack_require__.u(chunkId));
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkpaperclip_playground"] = self["webpackChunkpaperclip_playground"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = chunkLoadingCallback;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/wasm chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.v = (exports, wasmModuleId, wasmModuleHash, importsObj) => {
/******/ 			var req = fetch(__webpack_require__.p + "" + wasmModuleHash + ".module.wasm");
/******/ 			if (typeof WebAssembly.instantiateStreaming === 'function') {
/******/ 				return WebAssembly.instantiateStreaming(req, importsObj)
/******/ 					.then((res) => Object.assign(exports, res.instance.exports));
/******/ 			}
/******/ 			return req
/******/ 				.then((x) => x.arrayBuffer())
/******/ 				.then((bytes) => WebAssembly.instantiate(bytes, importsObj))
/******/ 				.then((res) => Object.assign(exports, res.instance.exports));
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/frontend/sagas/engine-worker.ts");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;