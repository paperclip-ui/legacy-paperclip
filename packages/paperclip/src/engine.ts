// 🙈

import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import {
  EngineEvent,
  patchVirtNode,
  EngineEventKind,
  resolveImportUri,
  DependencyContent,
  SheetInfo,
  EvaluatedEvent,
  VirtualNode,
  LoadedData,
  DiffedEvent,
  PaperclipSourceWatcher,
  ChangeKind
} from "paperclip-utils";
import { noop } from "./utils";

export type FileContent = {
  [identifier: string]: string;
};

export type EngineIO = {
  resolveFile?: (fromPath: string, toPath: string) => string;
  fileExists?: (filePath: string) => boolean;
  readFile?: (filePath: string) => string;
};

export type EngineOptions = {
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
  importedSheets: SheetInfo[];
  sheet: any;
  preview: VirtualNode;
};
export class Engine {
  private _listeners: EngineEventListener[] = [];
  private _rendered: Record<string, LoadedData> = {};
  private _io: EngineIO;

  constructor(private _native: any, private _onCrash: (err) => void = noop) {
    // only one native listener to for buffer performance
    this._native.add_listener(this._dispatch);

    this.onEvent(this._onEngineEvent);
    return this;
  }

  getGraphUris(): string[] {
    return this._native.get_graph_uris();
  }

  onEvent(listener: EngineEventListener) {
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

  private _onEngineEvent = (event: EngineEvent) => {
    if (event.kind === EngineEventKind.Evaluated) {
      const data: LoadedData = (this._rendered[event.uri] = {
        ...event.data,
        importedSheets: this.getImportedSheets(event)
      });

      this._dispatch({
        kind: EngineEventKind.Loaded,
        uri: event.uri,
        data
      });
    } else if (event.kind === EngineEventKind.Diffed) {
      const existingData = this._rendered[event.uri];

      const newData = (this._rendered[event.uri] = {
        ...existingData,
        imports: event.data.imports,
        exports: event.data.exports,
        importedSheets: this.getImportedSheets(event),
        allDependencies: event.data.allDependencies,
        sheet: event.data.sheet || existingData.sheet,
        preview: patchVirtNode(existingData.preview, event.data.mutations)
      });

      const removedSheetUris = [];

      for (const { uri } of existingData.importedSheets) {
        if (!newData.allDependencies.includes(uri)) {
          removedSheetUris.push(uri);
        }
      }

      const addedSheets: SheetInfo[] = [];
      for (const depUri of event.data.allDependencies) {
        // Note that we only do this if the sheet is already rendered -- engine
        // doesn't fire an event in that scenario. So we need to notify any listener that a sheet
        // has been added, including the actual sheet object.
        if (
          !existingData.allDependencies.includes(depUri) &&
          this._rendered[depUri]
        ) {
          addedSheets.push({
            uri: depUri,
            sheet: this._rendered[depUri].sheet
          });
        }
      }

      if (addedSheets.length || removedSheetUris.length) {
        this._dispatch({
          uri: event.uri,
          kind: EngineEventKind.ChangedSheets,
          data: {
            newSheets: addedSheets,
            removedSheetUris: removedSheetUris,
            allDependencies: event.data.allDependencies
          }
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
  parseContent(content: string) {
    return this._tryCatch(() => mapResult(this._native.parse_content(content)));
  }
  updateVirtualFileContent(uri: string, content: string) {
    return this._tryCatch(() => {
      const ret = mapResult(
        this._native.update_virtual_file_content(uri, content)
      );
      return ret;
    });
  }

  public getLoadedData(uri: string): LoadedData | null {
    return this._rendered[uri];
  }

  private _waitForLoadedData(uri: string): Promise<LoadedData> {
    if (this._rendered[uri]) {
      return Promise.resolve(this._rendered[uri]);
    }

    return this._waitForLoadedData2(uri);
  }

  private _waitForLoadedData2(uri: string): Promise<LoadedData> {
    return new Promise<LoadedData>(resolve => {
      const dispose = this.onEvent(event => {
        if (event.uri === uri && event.kind === EngineEventKind.Loaded) {
          dispose();
          resolve(event.data);
        }
      });
    });
  }
  getImportedSheets({
    data: { allDependencies }
  }: EvaluatedEvent | DiffedEvent) {
    // ick, wworks for now.

    const deps: SheetInfo[] = [];

    for (const depUri of allDependencies) {
      const data = this._rendered[depUri];
      if (!data) {
        console.error(`data not loaded, this shouldn't happen 😬.`);
      } else {
        deps.push({ uri: depUri, sheet: data.sheet });
      }
    }

    return deps;
  }

  run(uri: string): LoadedData {
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
  private _dispatch = (event: EngineEvent) => {
    // try-catch since engine will throw opaque error.
    for (const listener of this._listeners) {
      listener(event);
    }
  };
}

const getIOOptions = (options: EngineOptions = {}) =>
  Object.assign(
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
    options.io
  );

export const createEngine = createNativeEngine => async (
  options: EngineOptions,
  onCrash: any
) => {
  const { readFile, fileExists, resolveFile } = getIOOptions(options);
  return new Engine(
    await createNativeEngine(readFile, fileExists, resolveFile),
    onCrash
  );
};

export const createEngineSync = createNativeEngine => (
  options: EngineOptions,
  onCrash: any
) => {
  const { readFile, fileExists, resolveFile } = getIOOptions(options);
  return new Engine(
    createNativeEngine(readFile, fileExists, resolveFile),
    onCrash
  );
};

const existsSyncCaseSensitive = (uri: URL) => {
  const pathname = url.fileURLToPath(uri as any);
  const dir = path.dirname(pathname);
  const basename = path.basename(pathname);
  return fs.readdirSync(dir).includes(basename);
};

export const keepEngineInSyncWithFileSystem = (
  watcher: PaperclipSourceWatcher,
  engine: Engine
) => {
  return watcher.onChange((kind, uri) => {
    if (kind === ChangeKind.Changed) {
      engine.updateVirtualFileContent(
        uri,
        fs.readFileSync(new url.URL(uri), "utf8")
      );
    }
  });
};
