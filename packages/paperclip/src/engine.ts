// 🙈

import * as fs from "fs";
import * as path from "path";
import { NativeEngine } from "../native/pkg/paperclip";
import {
  EngineEvent,
  patchVirtNode,
  EngineEventKind,
  resolveImportUri,
  DependencyContent,
  getImports,
  Node,
  EvaluatedEvent,
  getAttributeStringValue,
  VirtualNode,
  LoadedEvent
} from "paperclip-utils";

export type FileContent = {
  [identifier: string]: string;
};

export type EngineIO = {
  resolveFile?: (fromPath: string, toPath: string) => string;
  fileExists?: (filePath: string) => boolean;
  readFile?: (filePath: string) => string;
};

export type EngineOptions = {
  httpuri?: string;
  io?: EngineIO;
};

const mapResult = result => {
  if (!result) {
    return result;
  }
  if (result.Ok) {
    return result.Ok;
  } else {
    return { error: result.Err };
  }
};

export type EngineEventListener = (event: EngineEvent) => void;

export type LoadResult = {
  importedSheets: Record<string, any>;
  sheet: any;
  preview: VirtualNode;
};

export class Engine {
  private _native: NativeEngine;
  private _listeners: EngineEventListener[] = [];
  private _rendered: Record<string, LoadedEvent> = {};
  private _loading: Record<string, boolean> = {};
  private _liveErrors: Record<string, any> = {};

  constructor(
    private _options: EngineOptions = {},
    private _onCrash: (err) => void = () => {}
  ) {
    const io: EngineIO = Object.assign(
      {
        readFile: uri => {
          return fs.readFileSync(new URL(uri) as any, "utf8");
        },
        fileExists: uri => {
          try {
            const url = new URL(uri) as any;

            // need to make sure that case matches _exactly_ since some
            // systems are sensitive to that.
            return existsSyncCaseSensitive(url) && fs.lstatSync(url).isFile();
          } catch (e) {
            console.error(e);
            return false;
          }
        },
        resolveFile: resolveImportUri(fs)
      },
      _options.io
    );

    const initNative = () => {
      this._native = NativeEngine.new(
        io.readFile,
        io.fileExists,
        io.resolveFile
      );

      // only one native listener to for buffer performance
      this._native.add_listener(this._dispatch);
    };

    initNative();

    this.onEvent(this._onEngineEvent);
  }

  onEvent(listener: EngineEventListener) {
    if (listener == null) {
      throw new Error(`listener cannot be undefined`);
    }
    this._listeners.push(listener);
    return () => {
      let i = this._listeners.indexOf(listener);
      if (i !== -1) {
        this._listeners.splice(i, 1);
      }
    };
  }
  private _onEngineEvent = (event: EngineEvent) => {
    if (event.kind === EngineEventKind.Error) {
      this._liveErrors[event.uri] = event;
      return;
    }

    this._liveErrors[event.uri] = undefined;

    if (event.kind === EngineEventKind.Evaluated) {
      this._dispatch(
        (this._rendered[event.uri] = {
          kind: EngineEventKind.Loaded,
          uri: event.uri,
          sheet: event.sheet,
          imports: event.imports,
          preview: event.preview,
          allDependencies: event.allDependencies,
          importedSheets: this.getImportedSheets(event)
        })
      );
    } else if (event.kind === EngineEventKind.Diffed) {
      const existingEvent = this._rendered[event.uri];

      this._rendered[event.uri] = {
        ...existingEvent,
        allDependencies: event.allDependencies,
        sheet: event.sheet || existingEvent.sheet,
        preview: patchVirtNode(existingEvent.preview, event.mutations)
      };

      const addedSheets = {};
      for (const depUri of event.allDependencies) {
        // Note that we only do this if the sheet is already rendered -- engine
        // doesn't fire an event in that scenario. So we need to notify any listener that a sheet
        // has been added, including the actual sheet object.
        if (
          !existingEvent.allDependencies.includes(depUri) &&
          this._rendered[depUri]
        ) {
          addedSheets[depUri] = this._rendered[depUri].sheet;
        }
      }

      if (Object.keys(addedSheets).length) {
        this._dispatch({
          uri: event.uri,
          kind: EngineEventKind.AddedSheets,
          sheets: addedSheets,
          allDependencies: event.allDependencies
        });
      }
    }
  };
  parseFile(uri: string) {
    return mapResult(this._native.parse_file(uri));
  }
  getLoadedAst(uri: string): DependencyContent {
    return this._tryCatch(() => this._native.get_loaded_ast(uri));
  }
  evaluateFileStyles(uri: string) {
    return this._tryCatch(() =>
      mapResult(this._native.evaluate_file_styles(uri))
    );
  }
  evaluateContentStyles(content: string, uri: string) {
    return this._tryCatch(() =>
      mapResult(this._native.evaluate_content_styles(content, uri))
    );
  }
  parseContent(content: string) {
    return this._tryCatch(() => mapResult(this._native.parse_content(content)));
  }
  updateVirtualFileContent(uri: string, content: string) {
    this._dispatch({ kind: EngineEventKind.Updating, uri });
    return this._tryCatch(() =>
      mapResult(this._native.update_virtual_file_content(uri, content))
    );
  }

  public getLoadedData(uri: string): LoadedEvent | null {
    return this._rendered[uri];
  }

  private _waitForLoadEvent(uri: string): Promise<LoadedEvent> {
    if (this._liveErrors[uri]) {
      return Promise.reject(this._liveErrors[uri]);
    }
    if (!this._loading[uri]) {
      const promise = this._waitForLoadEvent2(uri);

      return promise;
    } else if (this._rendered[uri]) {
      return Promise.resolve(this._rendered[uri]);
    }

    return this._waitForLoadEvent2(uri);
  }

  private _waitForLoadEvent2(uri: string): Promise<LoadedEvent> {
    return new Promise<LoadedEvent>(resolve => {
      const dispose = this.onEvent(event => {
        if (event.uri === uri && event.kind === EngineEventKind.Loaded) {
          dispose();
          resolve(event);
        }
      });
    });
  }
  getImportedSheets({ allDependencies }: EvaluatedEvent) {
    // ick, wworks for now.

    const deps = {};

    for (const depUri in this._rendered) {
      const event = this._rendered[depUri];
      if (allDependencies.includes(depUri)) {
        deps[depUri] = event.sheet;
      }
    }
    return deps;
  }

  async run(uri: string) {
    if (this._rendered[uri]) {
      for (const depUri of this._rendered[uri].allDependencies) {
        if (this._liveErrors[depUri]) {
          return Promise.reject(this._liveErrors[depUri]);
        }
      }
    }

    this._loading[uri] = true;
    this._dispatch({ kind: EngineEventKind.Loading, uri });

    this._tryCatch(() => mapResult(this._native.run(uri)));

    const info = await this._waitForLoadEvent(uri);

    return {
      sheet: info.sheet,
      preview: info.preview,
      importedSheets: info.importedSheets
    };
  }
  private _tryCatch = <TRet>(fn: () => TRet) => {
    try {
      return fn();
    } catch (e) {
      this._onCrash(e);
      return null;
    }
  };
  private _dispatch = (event: EngineEvent) => {
    // try-catch since engine will throw opaque error.
    try {
      for (const listener of this._listeners) {
        listener(event);
      }
    } catch (e) {
      throw e;
    }
  };
}

export const evaluateAllFileStyles = (
  engine: Engine,
  ast: Node,
  resourceUrl: string,
  _loadedStyleFiles = {}
) => {
  const imports = getImports(ast);
  const map = {};
  for (const imp of imports) {
    const src = getAttributeStringValue("src", imp);

    // CSS deprecated, so don't do this.
    // if (/\.css$/.test(src)) {
    //   const cssFilePath = resolveImportFile(fs)(resourceUrl, src);
    //   const transformPath = url.fileURLToPath(cssFilePath);
    //   let importedSheetCode = _loadedStyleFiles[cssFilePath];
    //   if (!importedSheetCode) {
    //     importedSheetCode = engine.evaluateFileStyles(cssFilePath);
    //   }

    //   map[transformPath] = importedSheetCode;
    // }
  }
  return map;
};

const existsSyncCaseSensitive = (uri: URL) => {
  const pathname = uri.pathname;
  const dir = path.dirname(pathname);
  const basename = path.basename(pathname);
  return fs.readdirSync(dir).includes(basename);
};
