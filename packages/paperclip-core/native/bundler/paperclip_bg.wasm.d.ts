/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_nativeengine_free(a: number): void;
export function nativeengine_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number
): number;
export function nativeengine_load(a: number, b: number, c: number): number;
export function nativeengine_run(a: number, b: number, c: number): number;
export function nativeengine_get_graph_uris(a: number): number;
export function nativeengine_reset(a: number): void;
export function nativeengine_add_listener(a: number, b: number): void;
export function nativeengine_lint_file(a: number, b: number, c: number): number;
export function nativeengine_get_virtual_node_source_info(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number
): number;
export function nativeengine_get_loaded_ast(
  a: number,
  b: number,
  c: number
): number;
export function nativeengine_get_dependency(
  a: number,
  b: number,
  c: number
): number;
export function nativeengine_parse_content(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number
): number;
export function nativeengine_parse_file(
  a: number,
  b: number,
  c: number
): number;
export function nativeengine_purge_unlinked_files(a: number): void;
export function nativeengine_get_expression_by_id(
  a: number,
  b: number,
  c: number
): number;
export function nativeengine_inspect_node_styles(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number
): number;
export function nativeengine_update_virtual_file_content(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number
): void;
export function __wbindgen_malloc(a: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number): number;
export function __wbindgen_free(a: number, b: number): void;
export function __wbindgen_exn_store(a: number): void;
