import * as path from "path";
import { Engine, createEngine, LoadResult, EngineIO } from "../../";
import {
  EngineErrorEvent,
  EngineDelegateEventKind,
  stringifyVirtualNode,
  stringifyCSSSheet,
  LoadedEvent
} from "paperclip-utils";

export type Graph = {
  [identifier: string]: string;
};

export const TEST_FIXTURE_SRC_DIRECTORY = path.join(
  __dirname,
  "../../test-fixtures/src"
);

export const createMockEngine = (
  graph: Graph,
  onErr = e => console.error(e),
  io: Partial<EngineIO> = {}
) =>
  createEngine(
    {
      io: {
        readFile: uri => graph[uri],
        fileExists: uri => Boolean(graph[uri]),
        resolveFile: (from, to) => {
          return path.join(path.dirname(from), to).replace(/\\/g, "/");
        },
        ...io
      }
    },
    onErr
  );

export const waitForError = (
  engine: Engine,
  test: (event: EngineErrorEvent) => boolean = () => true
) => {
  return new Promise<any>(resolve => {
    engine.onEvent(event => {
      if (event.kind === EngineDelegateEventKind.Error && test(event)) {
        resolve(event);
      }
    });
  });
};

export const waitForRender = (
  engine: Engine,
  test: (event: LoadedEvent) => boolean = () => true
) => {
  return new Promise<any>(resolve => {
    engine.onEvent(event => {
      if (event.kind === EngineDelegateEventKind.Loaded && test(event)) {
        resolve(event);
      }
    });
  });
};

export const stringifyLoadResult = (
  { sheet, preview, importedSheets: sheets }: LoadResult,
  shouldCleanHTML = true
) => {
  const sheetText = [...sheets.map(({ sheet }) => sheet), sheet]
    .map(sheet => {
      return stringifyCSSSheet(sheet, { protocol: "" });
    })
    .join("\n")
    .trim();

  const buffer = `<style>${sheetText}</style>${stringifyVirtualNode(preview)}`;
  return shouldCleanHTML ? cleanHTML(buffer) : buffer;
};

export const cleanHTML = (value: string) => {
  return value.replace(/[\r\n\t\s]+/g, " ").trim();
};

// eslint-disable-next-line
export const noop = () => {};
