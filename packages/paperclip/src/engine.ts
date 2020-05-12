import * as fs from "fs";
import * as url from "url";
import { NativeEngine } from "../native/pkg/paperclip";
import {
  EngineEvent,
  EngineEventKind,
  resolveImportUri,
  DependencyContent,
  getImports,
  Node,
  stringifyCSSSheet,
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
  private _native: any;
  private _listeners: EngineEventListener[] = [];

  constructor(private _options: EngineOptions = {}) {
    const io: EngineIO = Object.assign(
      {
        readFile: uri => {
          return fs.readFileSync(new URL(uri) as any, "utf8");
        },
        fileExists: uri => {
          try {
            const url = new URL(uri) as any;
            return fs.existsSync(url) && fs.lstatSync(url).isFile();
          } catch(e) {
            console.error(e);
            return false;
          }
        },
        resolveFile: resolveImportUri(fs)
      },
      _options.io
    );

    this._native = NativeEngine.new(io.readFile, io.fileExists, io.resolveFile);

    // only one native listener to for buffer performance
    this._native.add_listener(this._dispatch);
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
  parseFile(uri: string) {
    return mapResult(this._native.parse_file(uri));
  }
  getLoadedAst(uri: string): DependencyContent {
    return this._native.get_loaded_ast(uri);
  }
  evaluateFileStyles(uri: string) {
    return mapResult(this._native.evaluate_file_styles(uri));
  }
  evaluateContentStyles(content: string, uri: string) {
    return mapResult(this._native.evaluate_content_styles(content, uri));
  }
  parseContent(content: string) {
    return mapResult(this._native.parse_content(content));
  }
  updateVirtualFileContent(uri: string, content: string) {
    this._dispatch({ kind: EngineEventKind.Updating, uri });
    return mapResult(this._native.update_virtual_file_content(uri, content));    
  }
  load(uri: string) {
    this._dispatch({ kind: EngineEventKind.Loading, uri });
    return mapResult(this._native.load(uri, this._options.renderPart));
  }
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

export const evaluateAllFileStyles = (engine: Engine, ast: Node, resourceUrl: string, _loadedStyleFiles = {}) => {
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
}