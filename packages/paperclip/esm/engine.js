// 🙈
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function(resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import {
  patchVirtNode,
  EngineEventKind,
  resolveImportUri,
  ChangeKind
} from "paperclip-utils";
import { noop } from "./utils";
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
export class Engine {
  constructor(_createNativeEngine, _options = {}, _onCrash = noop) {
    this._createNativeEngine = _createNativeEngine;
    this._options = _options;
    this._onCrash = _onCrash;
    this._listeners = [];
    this._rendered = {};
    this._onEngineEvent = event => {
      if (event.kind === EngineEventKind.Evaluated) {
        const data = (this._rendered[event.uri] = Object.assign(
          Object.assign({}, event.data),
          { importedSheets: this.getImportedSheets(event) }
        ));
        this._dispatch({
          kind: EngineEventKind.Loaded,
          uri: event.uri,
          data
        });
      } else if (event.kind === EngineEventKind.Diffed) {
        const existingData = this._rendered[event.uri];
        const newData = (this._rendered[
          event.uri
        ] = Object.assign(Object.assign({}, existingData), {
          imports: event.data.imports,
          exports: event.data.exports,
          importedSheets: this.getImportedSheets(event),
          allDependencies: event.data.allDependencies,
          sheet: event.data.sheet || existingData.sheet,
          preview: patchVirtNode(existingData.preview, event.data.mutations)
        }));
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
    this._tryCatch = fn => {
      try {
        return fn();
      } catch (e) {
        this._onCrash(e);
        return null;
      }
    };
    this._dispatch = event => {
      // try-catch since engine will throw opaque error.
      for (const listener of this._listeners) {
        listener(event);
      }
    };
    this._io = Object.assign(
      {
        readFile: uri => {
          return fs.readFileSync(new URL(uri), "utf8");
        },
        fileExists: uri => {
          try {
            const url = new URL(uri);
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
  }
  $$load() {
    return __awaiter(this, void 0, void 0, function*() {
      const io = this._io;
      this._native = yield this._createNativeEngine(
        io.readFile,
        io.fileExists,
        io.resolveFile
      );
      // only one native listener to for buffer performance
      this._native.add_listener(this._dispatch);
      this.onEvent(this._onEngineEvent);
      return this;
    });
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
  updateVirtualFileContent(uri, content) {
    return this._tryCatch(() => {
      const ret = mapResult(
        this._native.update_virtual_file_content(uri, content)
      );
      return ret;
    });
  }
  getLoadedData(uri) {
    return this._rendered[uri];
  }
  _waitForLoadedData(uri) {
    if (this._rendered[uri]) {
      return Promise.resolve(this._rendered[uri]);
    }
    return this._waitForLoadedData2(uri);
  }
  _waitForLoadedData2(uri) {
    return new Promise(resolve => {
      const dispose = this.onEvent(event => {
        if (event.uri === uri && event.kind === EngineEventKind.Loaded) {
          dispose();
          resolve(event.data);
        }
      });
    });
  }
  getImportedSheets({ data: { allDependencies } }) {
    // ick, wworks for now.
    const deps = [];
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
  run(uri) {
    return __awaiter(this, void 0, void 0, function*() {
      const result = this._tryCatch(() => mapResult(this._native.run(uri)));
      if (result && result.error) {
        return Promise.reject(result.error);
      }
      return this._waitForLoadedData(uri);
    });
  }
}
export const createEngine = createNativeEngine => (options, onCrash) =>
  __awaiter(void 0, void 0, void 0, function*() {
    return yield new Engine(createNativeEngine, options, onCrash).$$load();
  });
const existsSyncCaseSensitive = uri => {
  const pathname = url.fileURLToPath(uri);
  const dir = path.dirname(pathname);
  const basename = path.basename(pathname);
  return fs.readdirSync(dir).includes(basename);
};
export const keepEngineInSyncWithFileSystem = (watcher, engine) => {
  return watcher.onChange((kind, uri) => {
    if (kind === ChangeKind.Changed) {
      engine.updateVirtualFileContent(
        uri,
        fs.readFileSync(new url.URL(uri), "utf8")
      );
    }
  });
};
