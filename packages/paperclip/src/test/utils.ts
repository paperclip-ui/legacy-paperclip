import * as path from "path";
import { Engine, LoadResult, EngineIO } from "../engine";
import {
  EngineErrorEvent,
  EngineEventKind,
  stringifyVirtualNode,
  stringifyCSSSheet,
  LoadedEvent
} from "paperclip-utils";

export type Graph = {
  [identifier: string]: string;
};

export const TEST_FIXTURE_DIRECTORY = path
  .join(__dirname, "../../test-fixtures")
  .replace(/\\/g, "/")
  .replace(/\/(\w):\//g, "/$1/");

export const createMockEngine = (
  graph: Graph,
  onErr = e => console.error(e),
  io: Partial<EngineIO> = {}
) =>
  new Engine(
    {
      io: {
        readFile: uri => graph[uri],
        fileExists: uri => Boolean(graph[uri]),
        resolveFile: (from, to) => {
          return path.join(path.dirname(from), to);
        },
        ...io
      }
    },
    onErr
  );

export const waitForError = (
  engine: Engine,
  test = (event: EngineErrorEvent) => true
) => {
  return new Promise<any>(resolve => {
    engine.onEvent(event => {
      if (event.kind === EngineEventKind.Error && test(event)) {
        resolve(event);
      }
    });
  });
};

export const waitForRender = (
  engine: Engine,
  test = (event: LoadedEvent) => true
) => {
  return new Promise<any>(resolve => {
    engine.onEvent(event => {
      if (event.kind === EngineEventKind.Loaded && test(event)) {
        resolve(event);
      }
    });
  });
};

export const stringifyLoadResult = ({
  sheet,
  preview,
  importedSheets: sheets
}: LoadResult) => {
  const sheetText = [...sheets.map(({ sheet }) => sheet), sheet]
    .map(sheet => {
      return stringifyCSSSheet(sheet, "");
    })
    .join("\n")
    .trim();

  const buffer = `<style>${sheetText}</style>${stringifyVirtualNode(preview)}`;
  return cleanHTML(buffer);
};

export const cleanHTML = (value: string) => {
  return value.replace(/[\r\n\t\s]+/g, " ").trim();
};

// eslint-disable-next-line
export const noop = () => {};
