// 🙈

import * as fs from "fs";
import * as url from "url";
import {
  EngineDelegateEvent,
  updateAllLoadedData,
  EngineDelegateEventKind,
  DependencyContent,
  SheetInfo,
  LoadedData,
  PaperclipResourceWatcher,
  ChangeKind,
  EvaluatedDataKind,
  DiffedPCData,
  getImportById,
  getImportBySrc,
  DependencyNodeContent,
  getAttributeStringValue,
  hasAttribute,
  INJECT_STYLES_TAG_NAME
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

export interface IEngineDelegate {
  onEvent: (listener: EngineDelegateEventListener) => () => void;
  parseFile: (uri: string) => any;
}

export enum EngineMode {
  SingleFrame,
  MultiFrame
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
  private _documents: Record<string, string> = {};

  constructor(
    private _native: any,
    private _onCrash: (err: any) => void = noop
  ) {
    // only one native listener to for buffer performance
    this._native.add_listener(this._dispatch);

    this.onEvent(this._onEngineEvent);
    return this;
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
    if (event.kind === EngineDelegateEventKind.Deleted) {
      delete this._rendered[event.uri];
    } else if (event.kind === EngineDelegateEventKind.Evaluated) {
      this._rendered = updateAllLoadedData(this._rendered, event);
      this._dispatch({
        kind: EngineDelegateEventKind.Loaded,
        uri: event.uri,
        data: this._rendered[event.uri]
      });
    } else if (event.kind === EngineDelegateEventKind.Diffed) {
      // console.log("EV", event.uri, event.kind, event.data);
      const existingData = this._rendered[event.uri];
      this._rendered = updateAllLoadedData(this._rendered, event);
      const newData = this._rendered[event.uri];

      if (
        existingData.kind === EvaluatedDataKind.PC &&
        newData.kind === EvaluatedDataKind.PC
      ) {
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
              sheet: this._rendered[depUri].sheet
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
              allImportedSheetUris: diffData.allImportedSheetUris
            }
          });
        }
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
    this._documents[uri] = content;
    return this._tryCatch(() => {
      const now = Date.now();
      const ret = mapResult(
        this._native.update_virtual_file_content(uri, content)
      );
      console.log(`updateVirtualFileContent MS: ${Date.now() - now}`);
      return ret;
    });
  }

  public getLoadedData(uri: string): LoadedData | null {
    return this._rendered[uri];
  }

  public getAllLoadedData(): Record<string, LoadedData> {
    return this._rendered;
  }
  reset() {
    this._rendered = {};
    this._documents = {};
    this._native.reset();
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

export const keepEngineInSyncWithFileSystem2 = (
  watcher: PaperclipResourceWatcher,
  engine: EngineDelegate
) => {
  return watcher.onChange((kind, uri) => {
    if (kind === ChangeKind.Changed) {
      engine.updateVirtualFileContent(
        uri,
        fs.readFileSync(new url.URL(uri), "utf8")
      );
    } else if (kind === ChangeKind.Removed) {
      engine.purgeUnlinkedFiles();
    }
  });
};

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
        ...delegate.getLoadedData(depUri)!
      };
      return record;
    }, {});
  } else {
    return {};
  }
};
