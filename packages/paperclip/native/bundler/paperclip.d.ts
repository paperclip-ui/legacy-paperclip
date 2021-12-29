/* tslint:disable */
/* eslint-disable */
/**
 */
export enum NativeEngineMode {
  SingleFrame,
  MultiFrame
}
/**
 */
export class NativeEngine {
  free(): void;
  /**
   * @param {Function} read_file
   * @param {Function} file_exists
   * @param {Function} resolve_file
   * @param {Function} get_lint_config
   * @param {number} engine_mode
   * @returns {NativeEngine}
   */
  static new(
    read_file: Function,
    file_exists: Function,
    resolve_file: Function,
    get_lint_config: Function,
    engine_mode: number
  ): NativeEngine;
  /**
   * @param {string} uri
   * @returns {any}
   */
  load(uri: string): any;
  /**
   * @param {string} uri
   * @returns {any}
   */
  run(uri: string): any;
  /**
   * @returns {any}
   */
  get_graph_uris(): any;
  /**
   */
  reset(): void;
  /**
   * @param {Function} listener
   */
  add_listener(listener: Function): void;
  /**
   * @param {string} uri
   * @returns {any}
   */
  lint_file(uri: string): any;
  /**
   * @param {Uint32Array} path
   * @param {string} uri
   * @returns {any}
   */
  get_virtual_node_source_info(path: Uint32Array, uri: string): any;
  /**
   * @param {string} uri
   * @returns {any}
   */
  get_loaded_ast(uri: string): any;
  /**
   * @param {string} uri
   * @returns {any}
   */
  get_dependency(uri: string): any;
  /**
   * @param {string} content
   * @param {string} uri
   * @returns {any}
   */
  parse_content(content: string, uri: string): any;
  /**
   * @param {string} uri
   * @returns {any}
   */
  parse_file(uri: string): any;
  /**
   */
  purge_unlinked_files(): void;
  /**
   * @param {string} id
   * @returns {any}
   */
  get_expression_by_id(id: string): any;
  /**
   * @param {Uint32Array} path
   * @param {string} uri
   * @param {number} screen_width
   * @returns {any}
   */
  inspect_node_styles(
    path: Uint32Array,
    uri: string,
    screen_width: number
  ): any;
  /**
   * @param {string} uri
   * @param {string} content
   */
  update_virtual_file_content(uri: string, content: string): void;
}
