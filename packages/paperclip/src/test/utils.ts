import * as path from "path";
import { createEngineDelegate } from "../node";
import { EngineDelegate } from "../core";
import {
  EngineErrorEvent,
  EngineDelegateEventKind,
  stringifyVirtualNode,
  stringifyCSSSheet,
  LoadedEvent
} from "paperclip-utils";
import { LoadResult } from "../core/delegate";

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
  io: Partial<any> = {}
) =>
  createEngineDelegate(
    {
      io: {
        readFile: uri => {
          return graph[uri];
        },
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
  engine: EngineDelegate,
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
  engine: EngineDelegate,
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
