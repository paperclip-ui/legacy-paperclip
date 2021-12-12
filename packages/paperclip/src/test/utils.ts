import * as path from "path";
import { createEngineDelegate } from "../node";
import { EngineDelegate, EngineMode } from "../core";
import {
  EngineErrorEvent,
  EngineDelegateEventKind,
  stringifyVirtualNode,
  stringifyCSSSheet,
  LoadedEvent,
  LoadedData,
  EvaluatedDataKind
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
  io: Partial<any> = {},
  mode = EngineMode.SingleFrame
) =>
  createEngineDelegate(
    {
      io: {
        readFile: uri => {
          return graph[uri];
        },
        fileExists: uri => {
          return Boolean(graph[uri]);
        },
        resolveFile: (from, to) => {
          if (to.charAt(0) === "/") {
            return to;
          }
          return path.join(path.dirname(from), to).replace(/\\/g, "/");
        },
        getLintConfig: () => {
          return {
            noUnusedStyles: true,
            enforceVars: ["font-family", "padding", "color"]
          };
        },
        ...io
      },
      mode
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
  data: LoadedData,
  shouldCleanHTML = true
) => {
  if (data.kind === EvaluatedDataKind.PC) {
    const { sheet, preview, importedSheets: sheets } = data;
    const sheetText = [...sheets.map(({ sheet }) => sheet), sheet]
      .map(sheet => {
        return stringifyCSSSheet(sheet, {
          resolveUrl: url => url.replace("file://", "")
        });
      })
      .join("\n")
      .trim();

    const buffer = `<style>${sheetText}</style>${stringifyVirtualNode(
      preview
    )}`;
    return shouldCleanHTML ? cleanHTML(buffer) : buffer;
  } else {
    return "";
  }
};

export const cleanHTML = (value: string) => {
  return value.replace(/[\r\n\t\s]+/g, " ").trim();
};

// eslint-disable-next-line
export const noop = () => {};
