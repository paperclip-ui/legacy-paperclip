(self["webpackChunkpaperclip_playground"] = self["webpackChunkpaperclip_playground"] || []).push([["paperclip_native_browser_paperclip_bg_js"],{

/***/ "../paperclip/native/browser/paperclip_bg.js":
/*!***************************************************!*\
  !*** ../paperclip/native/browser/paperclip_bg.js ***!
  \***************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
module.exports = (async () => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NativeEngineMode": () => /* binding */ NativeEngineMode,
/* harmony export */   "NativeEngine": () => /* binding */ NativeEngine,
/* harmony export */   "__wbg_new_59cb74e423758ede": () => /* binding */ __wbg_new_59cb74e423758ede,
/* harmony export */   "__wbg_stack_558ba5917b466edd": () => /* binding */ __wbg_stack_558ba5917b466edd,
/* harmony export */   "__wbg_error_4bb6c2a97407129a": () => /* binding */ __wbg_error_4bb6c2a97407129a,
/* harmony export */   "__wbindgen_object_drop_ref": () => /* binding */ __wbindgen_object_drop_ref,
/* harmony export */   "__wbindgen_string_new": () => /* binding */ __wbindgen_string_new,
/* harmony export */   "__wbg_call_56e03f05ec7df758": () => /* binding */ __wbg_call_56e03f05ec7df758,
/* harmony export */   "__wbg_call_0d50cec2d58307ad": () => /* binding */ __wbg_call_0d50cec2d58307ad,
/* harmony export */   "__wbindgen_boolean_get": () => /* binding */ __wbindgen_boolean_get,
/* harmony export */   "__wbindgen_json_parse": () => /* binding */ __wbindgen_json_parse,
/* harmony export */   "__wbindgen_string_get": () => /* binding */ __wbindgen_string_get,
/* harmony export */   "__wbindgen_debug_string": () => /* binding */ __wbindgen_debug_string,
/* harmony export */   "__wbindgen_throw": () => /* binding */ __wbindgen_throw
/* harmony export */ });
/* harmony import */ var _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./paperclip_bg.wasm */ "../paperclip/native/browser/paperclip_bg.wasm");
/* module decorator */ module = __webpack_require__.hmd(module);
_paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = await Promise.resolve(_paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__);


const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(_paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(_paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function handleError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_exn_store(addHeapObject(e));
        }
    };
}
/**
*/
const NativeEngineMode = Object.freeze({ SingleFrame:0,MultiFrame:1, });
/**
*/
class NativeEngine {

    static __wrap(ptr) {
        const obj = Object.create(NativeEngine.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbg_nativeengine_free(ptr);
    }
    /**
    * @param {Function} read_file
    * @param {Function} file_exists
    * @param {Function} resolve_file
    * @param {number} engine_mode
    * @returns {NativeEngine}
    */
    static new(read_file, file_exists, resolve_file, engine_mode) {
        var ret = _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.nativeengine_new(addHeapObject(read_file), addHeapObject(file_exists), addHeapObject(resolve_file), engine_mode);
        return NativeEngine.__wrap(ret);
    }
    /**
    * @param {string} uri
    * @returns {any}
    */
    load(uri) {
        var ptr0 = passStringToWasm0(uri, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.nativeengine_load(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {string} uri
    * @returns {any}
    */
    run(uri) {
        var ptr0 = passStringToWasm0(uri, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.nativeengine_run(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    get_graph_uris() {
        var ret = _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.nativeengine_get_graph_uris(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {Function} listener
    */
    add_listener(listener) {
        _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.nativeengine_add_listener(this.ptr, addHeapObject(listener));
    }
    /**
    * @param {string} uri
    * @returns {any}
    */
    get_loaded_ast(uri) {
        var ptr0 = passStringToWasm0(uri, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.nativeengine_get_loaded_ast(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {string} content
    * @returns {any}
    */
    parse_content(content) {
        var ptr0 = passStringToWasm0(content, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.nativeengine_parse_content(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {string} uri
    * @returns {any}
    */
    parse_file(uri) {
        var ptr0 = passStringToWasm0(uri, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.nativeengine_parse_file(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    */
    purge_unlinked_files() {
        _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.nativeengine_purge_unlinked_files(this.ptr);
    }
    /**
    * @param {string} uri
    * @param {string} content
    */
    update_virtual_file_content(uri, content) {
        var ptr0 = passStringToWasm0(uri, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(content, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.nativeengine_update_virtual_file_content(this.ptr, ptr0, len0, ptr1, len1);
    }
}

const __wbg_new_59cb74e423758ede = function() {
    var ret = new Error();
    return addHeapObject(ret);
};

const __wbg_stack_558ba5917b466edd = function(arg0, arg1) {
    var ret = getObject(arg1).stack;
    var ptr0 = passStringToWasm0(ret, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

const __wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
    try {
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_free(arg0, arg1);
    }
};

const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

const __wbindgen_string_new = function(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

const __wbg_call_56e03f05ec7df758 = handleError(function(arg0, arg1, arg2, arg3) {
    var ret = getObject(arg0).call(getObject(arg1), getObject(arg2), getObject(arg3));
    return addHeapObject(ret);
});

const __wbg_call_0d50cec2d58307ad = handleError(function(arg0, arg1, arg2) {
    var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
});

const __wbindgen_boolean_get = function(arg0) {
    const v = getObject(arg0);
    var ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

const __wbindgen_json_parse = function(arg0, arg1) {
    var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

const __wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

const __wbindgen_debug_string = function(arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_malloc, _paperclip_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};


return __webpack_exports__;
})();

/***/ }),

/***/ "../paperclip/native/browser/paperclip_bg.wasm":
/*!*****************************************************!*\
  !*** ../paperclip/native/browser/paperclip_bg.wasm ***!
  \*****************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";
/* harmony import */ var WEBPACK_IMPORTED_MODULE_0 = __webpack_require__(/*! ./paperclip_bg.js */ "../paperclip/native/browser/paperclip_bg.js");
module.exports = Promise.resolve(WEBPACK_IMPORTED_MODULE_0).then((WEBPACK_IMPORTED_MODULE_0) => {
	return __webpack_require__.v(exports, module.id, "53b23fcb4d48eb3d5914", {
		"./paperclip_bg.js": {
			"__wbg_new_59cb74e423758ede": WEBPACK_IMPORTED_MODULE_0.__wbg_new_59cb74e423758ede,
			"__wbg_stack_558ba5917b466edd": WEBPACK_IMPORTED_MODULE_0.__wbg_stack_558ba5917b466edd,
			"__wbg_error_4bb6c2a97407129a": WEBPACK_IMPORTED_MODULE_0.__wbg_error_4bb6c2a97407129a,
			"__wbindgen_object_drop_ref": WEBPACK_IMPORTED_MODULE_0.__wbindgen_object_drop_ref,
			"__wbindgen_string_new": WEBPACK_IMPORTED_MODULE_0.__wbindgen_string_new,
			"__wbg_call_56e03f05ec7df758": WEBPACK_IMPORTED_MODULE_0.__wbg_call_56e03f05ec7df758,
			"__wbg_call_0d50cec2d58307ad": WEBPACK_IMPORTED_MODULE_0.__wbg_call_0d50cec2d58307ad,
			"__wbindgen_boolean_get": WEBPACK_IMPORTED_MODULE_0.__wbindgen_boolean_get,
			"__wbindgen_json_parse": WEBPACK_IMPORTED_MODULE_0.__wbindgen_json_parse,
			"__wbindgen_string_get": WEBPACK_IMPORTED_MODULE_0.__wbindgen_string_get,
			"__wbindgen_debug_string": WEBPACK_IMPORTED_MODULE_0.__wbindgen_debug_string,
			"__wbindgen_throw": WEBPACK_IMPORTED_MODULE_0.__wbindgen_throw
		}
	});
})

/***/ })

}]);