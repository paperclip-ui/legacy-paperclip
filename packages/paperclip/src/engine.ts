import * as fs from "fs";
import * as url from "url";
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
  resolveImportFile,
  getAttributeStringValue
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
  renderPart?: string;
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

export class Engine {
  private _native: NativeEngine;
  private _listeners: EngineEventListener[] = [];
  private _rendered: Record<string, EvaluatedEvent> = {};
  private _loading: Record<string, boolean> = {};

  constructor(
    private _options: EngineOptions = {},
    private _onCrash: () => void = () => {}
  ) {
    const io: EngineIO = Object.assign(
      {
        readFile: uri => {
          return fs.readFileSync(new URL(uri) as any, "utf8");
        },
        fileExists: uri => {
          try {
            const url = new URL(uri) as any;
            return fs.existsSync(url) && fs.lstatSync(url).isFile();
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
    if (event.kind === EngineEventKind.Evaluated) {
      this._rendered[event.uri] = event;
    } else if (event.kind === EngineEventKind.Diffed) {
      const existingEvent = this._rendered[event.uri];

      this._rendered[event.uri] = {
        ...existingEvent,
        dependencies: event.dependencies,
        info: {
          ...existingEvent.info,
          sheet: event.sheet || existingEvent.info.sheet,
          preview: patchVirtNode(existingEvent.info.preview, event.mutations)
        }
      };
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
  render(uri: string): Promise<EvaluatedEvent> {
    if (!this._loading[uri]) {
      this.load(uri);
    }

    return this.getRenderEvent(uri);
  }
  getRenderEvent(uri: string): Promise<EvaluatedEvent> {
    if (!this._loading[uri]) {
      this.load(uri);
    }

    if (this._rendered[uri]) {
      return Promise.resolve(this._rendered[uri]);
    }
    return new Promise(resolve => {
      const dispose = this.onEvent(event => {
        if (event.uri === uri && event.kind === EngineEventKind.Evaluated) {
          dispose();
          resolve(event);
        }
      });
    });
  }
  async getImportedSheets(uri: string): Promise<any> {
    // ick, wworks for now.
    const entry = await this.getRenderEvent(uri);

    const deps = {};

    for (const depUri in this._rendered) {
      const event = this._rendered[depUri];
      if (entry.dependencies.includes(depUri)) {
        deps[depUri] = event.info.sheet;
      }
    }
    return deps;
  }

  load(uri: string) {
    this._loading[uri] = true;
    this._dispatch({ kind: EngineEventKind.Loading, uri });
    return this._tryCatch(() =>
      mapResult(this._native.load(uri, this._options.renderPart))
    );
  }
  private _tryCatch = <TRet>(fn: () => TRet) => {
    try {
      return fn();
    } catch (e) {
      this._onCrash();
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
      console.error(e);
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
    if (/\.css$/.test(src)) {
      const cssFilePath = resolveImportFile(fs)(resourceUrl, src);
      const transformPath = url.fileURLToPath(cssFilePath);
      let importedSheetCode = _loadedStyleFiles[cssFilePath];
      if (!importedSheetCode) {
        importedSheetCode = engine.evaluateFileStyles(cssFilePath);
      }

      map[transformPath] = importedSheetCode;
    }
  }
  return map;
};
