// 🙈
import {
  EngineDelegateEvent,
  updateAllLoadedData,
  EngineDelegateEventKind,
  DependencyContent,
  SheetInfo,
  LoadedData,
  EvaluatedDataKind,
  DiffedPCData,
  getImportById,
  getImportBySrc,
  DependencyNodeContent,
  getAttributeStringValue,
  hasAttribute,
  Diagnostic,
  INJECT_STYLES_TAG_NAME,
  CoverageReport,
  NodeStyleInspection,
  RootExpression,
  VirtNodeSource,
  Dependency,
  Module,
  DiffedEvent,
  LoadedPCData,
  ExprTextSource,
} from "@paperclip-ui/utils";
import { noop } from "./utils";

export type FileContent = {
  [identifier: string]: string;
};

export type VirtualNodeSourceInfo = {
  sourceId: string;
  textSource: ExprTextSource;
};

export type ErrorResult = { error: any };

export const isErrorResult = (data: any): data is ErrorResult => {
  return data.error != null;
};

export type EngineIO = {
  resolveFile?: (fromPath: string, toPath: string) => string;
  fileExists?: (filePath: string) => boolean;
  readFile?: (filePath: string) => string;
};

export interface IEngineDelegate {
  onEvent: (listener: EngineDelegateEventListener) => () => void;
  parseFile: (uri: string) => any;
}

export enum EngineMode {
  SingleFrame,
  MultiFrame,
}

export type EngineOptions = {
  io?: EngineIO;
  mode?: EngineMode;
};

const mapResult = (result: any) => {
  if (!result) {
    return result;
  }
  if (result.Ok) {
    return result.Ok;
  } else {
    return { error: result.Err };
  }
};

export type EngineDelegateEventListener = (event: EngineDelegateEvent) => void;

export enum EngineDelegateEventType {
  Loaded = "Loaded",
  ChangedSheets = "ChangedSheets",
}

/*
Engine delegate is the bridge between JS and the rust engine. Primary reason
for this class instead of shoving functionality into the engine itself is for performance & 
reducing amount of data being passed between Rust <-> JS
*/

export class EngineDelegate {
  private _listeners: EngineDelegateEventListener[] = [];
  private _rendered: Record<string, LoadedData> = {};
  private _documents: Record<string, string> = {};
  private _graph: Record<string, Dependency> = {};

  constructor(
    private _native: any,
    private _io: EngineIO,
    private _onCrash: (err: any) => void = noop
  ) {
    // only one native listener to for buffer performance
    this._native.add_listener(this._dispatch);

    this.onEvent(this._onEngineEvent);
    return this;
  }

  resolveFile(fromPath: string, toPath: string) {
    return this._io.resolveFile(fromPath, toPath);
  }

  onEvent(listener: EngineDelegateEventListener) {
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

  private _onEngineEvent = (event: EngineDelegateEvent) => {
    if (!this._documents[event.uri]) {
      this._documents[event.uri] = this._io.readFile(event.uri);
    }

    if (event.kind === EngineDelegateEventKind.Deleted) {
      delete this._rendered[event.uri];
    } else if (event.kind === EngineDelegateEventKind.Evaluated) {
      this._rendered = updateAllLoadedData(this._rendered, event);
      this._dispatch({
        kind: EngineDelegateEventKind.Loaded,
        uri: event.uri,
        data: this._rendered[event.uri],
      });
    } else if (event.kind === EngineDelegateEventKind.Diffed) {
      const existingData = this._rendered[event.uri];
      this._rendered = updateAllLoadedData(this._rendered, event);
      const newData = this._rendered[event.uri];

      if (
        existingData.kind === EvaluatedDataKind.PC &&
        newData.kind === EvaluatedDataKind.PC
      ) {
        this._handlePCDiff(event, existingData, newData);
      }
    }
  };

  private _handlePCDiff = (
    event: DiffedEvent,
    existingData: LoadedPCData,
    newData: LoadedPCData
  ) => {
    const removedSheetUris: string[] = [];
    const diffData = event.data as DiffedPCData;

    for (const { uri } of existingData.importedSheets) {
      if (!newData.allImportedSheetUris.includes(uri)) {
        removedSheetUris.push(uri);
      }
    }

    const addedSheets: SheetInfo[] = [];

    for (
      let i = 0, { length } = diffData.allImportedSheetUris;
      i < length;
      i++
    ) {
      const depUri = diffData.allImportedSheetUris[i];
      // Note that we only do this if the sheet is already rendered -- engine
      // doesn't fire an event in that scenario. So we need to notify any listener that a sheet
      // has been added, including the actual sheet object.
      if (
        !existingData.allImportedSheetUris.includes(depUri) &&
        this._rendered[depUri]
      ) {
        addedSheets.push({
          uri: depUri,
          index: i,
          sheet: this._rendered[depUri].sheet,
        });
      }
    }

    if (addedSheets.length || removedSheetUris.length) {
      this._dispatch({
        uri: event.uri,
        kind: EngineDelegateEventKind.ChangedSheets,
        data: {
          // TODO - don't do this - instead include newSheetUris and
          // allow renderer to fetch these sheets
          newSheets: addedSheets,
          removedSheetUris: removedSheetUris,
          allImportedSheetUris: diffData.allImportedSheetUris,
        },
      });
    }
  };

  parseFile(uri: string): Module | ErrorResult {
    return mapResult(this._native.parse_file(uri));
  }
  lint(uri: string): Diagnostic[] {
    return this._native.lint_file(uri);
  }
  getVirtualNodeSourceInfo(
    nodePath: number[],
    uri: string
  ): VirtualNodeSourceInfo {
    return this._native.get_virtual_node_source_info(nodePath, uri);
  }
  generateCoverageReport(): CoverageReport {
    return this._tryCatch(() => {
      return mapResult(this._native.generate_coverage_report());
    });
  }
  getLoadedAst(uri: string): DependencyContent {
    return this._tryCatch(() => this._native.get_loaded_ast(uri));
  }
  getLoadedDependency(uri: string) {
    return (
      this._graph[uri] ||
      (this._graph[uri] = this._tryCatch(() =>
        this._native.get_dependency(uri)
      ))
    );
  }
  parseContent(content: string, uri: string): Module | ErrorResult {
    return this._tryCatch(() =>
      mapResult(this._native.parse_content(content, uri))
    );
  }
  purgeUnlinkedFiles() {
    return this._tryCatch(() => {
      const ret = mapResult(this._native.purge_unlinked_files());
      return ret;
    });
  }
  getVirtualContent(uri: string) {
    return this._documents[uri];
  }
  updateVirtualFileContent(uri: string, content: string) {
    this._graph[uri] = undefined;

    // only define if successfuly loaded
    this._documents[uri] = content;

    return this._tryCatch(() => {
      const ret = mapResult(
        this._native.update_virtual_file_content(uri, content)
      );

      return ret;
    });
  }

  public inspectNodeStyles(
    source: VirtNodeSource,
    screenWidth: number
  ): NodeStyleInspection {
    return this._native.inspect_node_styles(
      source.path,
      source.uri,
      screenWidth
    );
  }

  public getLoadedData(uri: string): LoadedData | null {
    return this._rendered[uri];
  }

  public getExpressionById(id: string): [string, RootExpression] {
    return this._native.get_expression_by_id(id);
  }

  public getAllLoadedData(): Record<string, LoadedData> {
    return this._rendered;
  }
  public getLoadedGraph(): Record<string, Dependency> {
    const map = {};
    for (const uri in this._rendered) {
      map[uri] = this.getLoadedDependency(uri);
    }
    return map;
  }

  reset() {
    this._rendered = {};
    this._documents = {};
    this._native.reset();
  }

  open(uri: string): LoadedData {
    this._graph[uri] = undefined;

    // need to load document so that it's accessible via source writer
    if (!this._documents[uri]) {
      this._documents[uri] = this._io.readFile(uri);
    }

    const result = this._tryCatch(() => mapResult(this._native.run(uri)));
    if (result && result.error) {
      throw result.error;
    }

    return this._rendered[uri];
  }
  private _tryCatch = <TRet>(fn: () => TRet) => {
    try {
      return fn();
    } catch (e) {
      this._onCrash(e);
      return null;
    }
  };
  private _dispatch = (event: EngineDelegateEvent) => {
    // try-catch since engine will throw opaque error.
    for (const listener of this._listeners) {
      listener(event);
    }
  };
}

export type LoadedDataDetails = {
  src?: string;
  injectStyles?: boolean;
} & LoadedData;

/**
 * Kept separate from the engine since this is more of a util function for ID inspection
 */

export const getEngineImports = (
  uri: string,
  delegate: EngineDelegate
): Record<string, LoadedDataDetails> => {
  const data = delegate.getLoadedData(uri);

  if (data?.kind === EvaluatedDataKind.PC) {
    const ast = delegate.getLoadedAst(uri) as DependencyNodeContent;
    return Object.keys(data.dependencies).reduce((record: any, id: string) => {
      const depUri = data.dependencies[id];
      const imp = ast && (getImportById(id, ast) || getImportBySrc(id, ast));
      record[id] = {
        uri: imp && getAttributeStringValue("src", imp),
        injectStyles: imp && hasAttribute(INJECT_STYLES_TAG_NAME, imp),
        ...delegate.getLoadedData(depUri)!,
      };
      return record;
    }, {});
  } else {
    return {};
  }
};
