import * as wasm from "./paperclip_bg.wasm";

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) {
  return heap[idx];
}

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

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];

  heap[idx] = obj;
  return idx;
}

const lTextDecoder =
  typeof TextDecoder === "undefined"
    ? (0, module.require)("util").TextDecoder
    : TextDecoder;

let cachedTextDecoder = new lTextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true
});

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
  if (
    cachegetUint8Memory0 === null ||
    cachegetUint8Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder =
  typeof TextEncoder === "undefined"
    ? (0, module.require)("util").TextEncoder
    : TextEncoder;

let cachedTextEncoder = new lTextEncoder("utf-8");

const encodeString =
  typeof cachedTextEncoder.encodeInto === "function"
    ? function(arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
      }
    : function(arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
          read: arg.length,
          written: buf.length
        };
      };

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length);
    getUint8Memory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len);

  const mem = getUint8Memory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3));
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
  if (
    cachegetInt32Memory0 === null ||
    cachegetInt32Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachegetInt32Memory0;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

function debugString(val) {
  // primitive types
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  // objects
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
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
  if (className == "Object") {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  // errors
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`;
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
  }
}

function getArrayU8FromWasm0(ptr, len) {
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachegetUint32Memory0 = null;
function getUint32Memory0() {
  if (
    cachegetUint32Memory0 === null ||
    cachegetUint32Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
  }
  return cachegetUint32Memory0;
}

function passArray32ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 4);
  getUint32Memory0().set(arg, ptr / 4);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
/**
 */
export const NativeEngineMode = Object.freeze({
  SingleFrame: 0,
  "0": "SingleFrame",
  MultiFrame: 1,
  "1": "MultiFrame"
});
/**
 */
export class NativeEngine {
  static __wrap(ptr) {
    const obj = Object.create(NativeEngine.prototype);
    obj.ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_nativeengine_free(ptr);
  }
  /**
   * @param {Function} read_file
   * @param {Function} file_exists
   * @param {Function} resolve_file
   * @param {Function} get_lint_config
   * @param {number} engine_mode
   * @returns {NativeEngine}
   */
  static new(
    read_file,
    file_exists,
    resolve_file,
    get_lint_config,
    engine_mode
  ) {
    var ret = wasm.nativeengine_new(
      addHeapObject(read_file),
      addHeapObject(file_exists),
      addHeapObject(resolve_file),
      addHeapObject(get_lint_config),
      engine_mode
    );
    return NativeEngine.__wrap(ret);
  }
  /**
   * @param {string} uri
   * @returns {any}
   */
  load(uri) {
    var ptr0 = passStringToWasm0(
      uri,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.nativeengine_load(this.ptr, ptr0, len0);
    return takeObject(ret);
  }
  /**
   * @param {string} uri
   * @returns {any}
   */
  run(uri) {
    var ptr0 = passStringToWasm0(
      uri,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.nativeengine_run(this.ptr, ptr0, len0);
    return takeObject(ret);
  }
  /**
   * @returns {any}
   */
  get_graph_uris() {
    var ret = wasm.nativeengine_get_graph_uris(this.ptr);
    return takeObject(ret);
  }
  /**
   */
  reset() {
    wasm.nativeengine_reset(this.ptr);
  }
  /**
   * @param {Function} listener
   */
  add_listener(listener) {
    wasm.nativeengine_add_listener(this.ptr, addHeapObject(listener));
  }
  /**
   * @param {string} uri
   * @returns {any}
   */
  lint_file(uri) {
    var ptr0 = passStringToWasm0(
      uri,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.nativeengine_lint_file(this.ptr, ptr0, len0);
    return takeObject(ret);
  }
  /**
   * @param {Uint32Array} path
   * @param {string} uri
   * @returns {any}
   */
  get_virtual_node_source_info(path, uri) {
    var ptr0 = passArray32ToWasm0(path, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ptr1 = passStringToWasm0(
      uri,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len1 = WASM_VECTOR_LEN;
    var ret = wasm.nativeengine_get_virtual_node_source_info(
      this.ptr,
      ptr0,
      len0,
      ptr1,
      len1
    );
    return takeObject(ret);
  }
  /**
   * @param {string} uri
   * @returns {any}
   */
  get_loaded_ast(uri) {
    var ptr0 = passStringToWasm0(
      uri,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.nativeengine_get_loaded_ast(this.ptr, ptr0, len0);
    return takeObject(ret);
  }
  /**
   * @param {string} uri
   * @returns {any}
   */
  get_dependency(uri) {
    var ptr0 = passStringToWasm0(
      uri,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.nativeengine_get_dependency(this.ptr, ptr0, len0);
    return takeObject(ret);
  }
  /**
   * @param {string} content
   * @param {string} uri
   * @returns {any}
   */
  parse_content(content, uri) {
    var ptr0 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    var ptr1 = passStringToWasm0(
      uri,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len1 = WASM_VECTOR_LEN;
    var ret = wasm.nativeengine_parse_content(this.ptr, ptr0, len0, ptr1, len1);
    return takeObject(ret);
  }
  /**
   * @param {string} uri
   * @returns {any}
   */
  parse_file(uri) {
    var ptr0 = passStringToWasm0(
      uri,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.nativeengine_parse_file(this.ptr, ptr0, len0);
    return takeObject(ret);
  }
  /**
   */
  purge_unlinked_files() {
    wasm.nativeengine_purge_unlinked_files(this.ptr);
  }
  /**
   * @param {string} id
   * @returns {any}
   */
  get_expression_by_id(id) {
    var ptr0 = passStringToWasm0(
      id,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.nativeengine_get_expression_by_id(this.ptr, ptr0, len0);
    return takeObject(ret);
  }
  /**
   * @param {Uint32Array} path
   * @param {string} uri
   * @param {number} screen_width
   * @returns {any}
   */
  inspect_node_styles(path, uri, screen_width) {
    var ptr0 = passArray32ToWasm0(path, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ptr1 = passStringToWasm0(
      uri,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len1 = WASM_VECTOR_LEN;
    var ret = wasm.nativeengine_inspect_node_styles(
      this.ptr,
      ptr0,
      len0,
      ptr1,
      len1,
      screen_width
    );
    return takeObject(ret);
  }
  /**
   * @param {string} uri
   * @param {string} content
   */
  update_virtual_file_content(uri, content) {
    var ptr0 = passStringToWasm0(
      uri,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    var ptr1 = passStringToWasm0(
      content,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len1 = WASM_VECTOR_LEN;
    wasm.nativeengine_update_virtual_file_content(
      this.ptr,
      ptr0,
      len0,
      ptr1,
      len1
    );
  }
}

export function __wbg_new_693216e109162396() {
  var ret = new Error();
  return addHeapObject(ret);
}

export function __wbg_stack_0ddaca5d1abfb52f(arg0, arg1) {
  var ret = getObject(arg1).stack;
  var ptr0 = passStringToWasm0(
    ret,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len0 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len0;
  getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}

export function __wbg_error_09919627ac0992f5(arg0, arg1) {
  try {
    console.error(getStringFromWasm0(arg0, arg1));
  } finally {
    wasm.__wbindgen_free(arg0, arg1);
  }
}

export function __wbindgen_object_drop_ref(arg0) {
  takeObject(arg0);
}

export function __wbindgen_object_clone_ref(arg0) {
  var ret = getObject(arg0);
  return addHeapObject(ret);
}

export function __wbg_process_2f24d6544ea7b200(arg0) {
  var ret = getObject(arg0).process;
  return addHeapObject(ret);
}

export function __wbindgen_is_object(arg0) {
  const val = getObject(arg0);
  var ret = typeof val === "object" && val !== null;
  return ret;
}

export function __wbg_versions_6164651e75405d4a(arg0) {
  var ret = getObject(arg0).versions;
  return addHeapObject(ret);
}

export function __wbg_node_4b517d861cbcb3bc(arg0) {
  var ret = getObject(arg0).node;
  return addHeapObject(ret);
}

export function __wbindgen_is_string(arg0) {
  var ret = typeof getObject(arg0) === "string";
  return ret;
}

export function __wbg_modulerequire_3440a4bcf44437db() {
  return handleError(function(arg0, arg1) {
    var ret = module.require(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  }, arguments);
}

export function __wbg_crypto_98fc271021c7d2ad(arg0) {
  var ret = getObject(arg0).crypto;
  return addHeapObject(ret);
}

export function __wbg_msCrypto_a2cdb043d2bfe57f(arg0) {
  var ret = getObject(arg0).msCrypto;
  return addHeapObject(ret);
}

export function __wbg_newwithlength_929232475839a482(arg0) {
  var ret = new Uint8Array(arg0 >>> 0);
  return addHeapObject(ret);
}

export function __wbg_self_c6fbdfc2918d5e58() {
  return handleError(function() {
    var ret = self.self;
    return addHeapObject(ret);
  }, arguments);
}

export function __wbg_window_baec038b5ab35c54() {
  return handleError(function() {
    var ret = window.window;
    return addHeapObject(ret);
  }, arguments);
}

export function __wbg_globalThis_3f735a5746d41fbd() {
  return handleError(function() {
    var ret = globalThis.globalThis;
    return addHeapObject(ret);
  }, arguments);
}

export function __wbg_global_1bc0b39582740e95() {
  return handleError(function() {
    var ret = global.global;
    return addHeapObject(ret);
  }, arguments);
}

export function __wbindgen_is_undefined(arg0) {
  var ret = getObject(arg0) === undefined;
  return ret;
}

export function __wbg_newnoargs_be86524d73f67598(arg0, arg1) {
  var ret = new Function(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
}

export function __wbg_call_888d259a5fefc347() {
  return handleError(function(arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
  }, arguments);
}

export function __wbindgen_string_new(arg0, arg1) {
  var ret = getStringFromWasm0(arg0, arg1);
  return addHeapObject(ret);
}

export function __wbg_call_346669c262382ad7() {
  return handleError(function(arg0, arg1, arg2) {
    var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
  }, arguments);
}

export function __wbindgen_json_serialize(arg0, arg1) {
  const obj = getObject(arg1);
  var ret = JSON.stringify(obj === undefined ? null : obj);
  var ptr0 = passStringToWasm0(
    ret,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len0 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len0;
  getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}

export function __wbg_call_8a893cac80deeb51() {
  return handleError(function(arg0, arg1, arg2, arg3) {
    var ret = getObject(arg0).call(
      getObject(arg1),
      getObject(arg2),
      getObject(arg3)
    );
    return addHeapObject(ret);
  }, arguments);
}

export function __wbindgen_string_get(arg0, arg1) {
  const obj = getObject(arg1);
  var ret = typeof obj === "string" ? obj : undefined;
  var ptr0 = isLikeNone(ret)
    ? 0
    : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len0 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len0;
  getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}

export function __wbindgen_boolean_get(arg0) {
  const v = getObject(arg0);
  var ret = typeof v === "boolean" ? (v ? 1 : 0) : 2;
  return ret;
}

export function __wbindgen_json_parse(arg0, arg1) {
  var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
}

export function __wbg_randomFillSync_64cc7d048f228ca8() {
  return handleError(function(arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
  }, arguments);
}

export function __wbg_subarray_8b658422a224f479(arg0, arg1, arg2) {
  var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
}

export function __wbg_getRandomValues_98117e9a7e993920() {
  return handleError(function(arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
  }, arguments);
}

export function __wbg_length_1eb8fc608a0d4cdb(arg0) {
  var ret = getObject(arg0).length;
  return ret;
}

export function __wbindgen_memory() {
  var ret = wasm.memory;
  return addHeapObject(ret);
}

export function __wbg_buffer_397eaa4d72ee94dd(arg0) {
  var ret = getObject(arg0).buffer;
  return addHeapObject(ret);
}

export function __wbg_new_a7ce447f15ff496f(arg0) {
  var ret = new Uint8Array(getObject(arg0));
  return addHeapObject(ret);
}

export function __wbg_set_969ad0a60e51d320(arg0, arg1, arg2) {
  getObject(arg0).set(getObject(arg1), arg2 >>> 0);
}

export function __wbindgen_debug_string(arg0, arg1) {
  var ret = debugString(getObject(arg1));
  var ptr0 = passStringToWasm0(
    ret,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  var len0 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len0;
  getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}

export function __wbindgen_throw(arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1));
}
