// 🙈

import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import {
  EngineDelegateEvent,
  updateAllLoadedData,
  EngineDelegateEventKind,
  resolveImportUri,
  DependencyContent,
  SheetInfo,
  VirtualNode,
  LoadedData,
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

export enum EngineMode {
  SingleFrame,
  MultiFrame
}

export type EngineOptions = {
  io?: EngineIO;
  mode?: EngineMode;
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

export type EngineDelegateEventListener = (event: EngineDelegateEvent) => void;

export type LoadResult = {
  importedSheets: SheetInfo[];
  sheet: any;
  preview: VirtualNode;
};

export enum EngineDelegateEventType {
  Loaded = "Loaded",
  ChangedSheets = "ChangedSheets"
}

/*
Engine delegate is the bridge between JS and the rust engine. Primary reason
for this class instead of shoving functionality into the engine itself is for performance & 
reducing amount of data being passed between Rust <-> JS
*/

export class EngineDelegate {
  private _listeners: EngineDelegateEventListener[] = [];
  private _rendered: Record<string, LoadedData> = {};

  constructor(private _native: any, private _onCrash: (err) => void = noop) {
    // only one native listener to for buffer performance
    this._native.add_listener(this._dispatch);

    this.onEvent(this._onEngineDelegateEvent);
    return this;
  }

  getGraphUris(): string[] {
    return this._native.get_graph_uris();
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

  private _onEngineDelegateEvent = (event: EngineDelegateEvent) => {
    if (event.kind === EngineDelegateEventKind.Evaluated) {
      this._rendered = updateAllLoadedData(this._rendered, event);
      this._dispatch({
        kind: EngineDelegateEventKind.Loaded,
        uri: event.uri,
        data: this._rendered[event.uri]
      });
    } else if (event.kind === EngineDelegateEventKind.Diffed) {
      const existingData = this._rendered[event.uri];
      this._rendered = updateAllLoadedData(this._rendered, event);
      const newData = this._rendered[event.uri];

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
          kind: EngineDelegateEventKind.ChangedSheets,
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

  open(uri: string): LoadedData {
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
      resolveFile: resolveImportUri(fs),
      mode: EngineMode.SingleFrame
    },
    options.io,
    { mode: options.mode }
  );

export const createEngineDelegate = createNativeEngine => async (
  options: EngineOptions,
  onCrash: any
) => {
  const { readFile, fileExists, resolveFile, mode } = getIOOptions(options);
  return new EngineDelegate(
    await createNativeEngine(readFile, fileExists, resolveFile, mode),
    onCrash
  );
};

export const createEngineDelegateSync = createNativeEngine => (
  options: EngineOptions,
  onCrash: any
) => {
  const { readFile, fileExists, resolveFile, mode } = getIOOptions(options);
  return new EngineDelegate(
    createNativeEngine(readFile, fileExists, resolveFile, mode),
    onCrash
  );
};

const existsSyncCaseSensitive = (uri: URL) => {
  const pathname = url.fileURLToPath(uri as any);
  const dir = path.dirname(pathname);
  const basename = path.basename(pathname);
  return fs.readdirSync(dir).includes(basename);
};

export const keepEngineInSyncWithFileSystem2 = (
  watcher: PaperclipSourceWatcher,
  engine: EngineDelegate
) => {
  console.log("CH");
  return watcher.onChange((kind, uri) => {
    console.log(kind);
    if (kind === ChangeKind.Changed) {
      engine.updateVirtualFileContent(
        uri,
        fs.readFileSync(new url.URL(uri), "utf8")
      );
    }
  });
};
