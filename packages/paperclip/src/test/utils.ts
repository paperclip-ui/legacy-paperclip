import * as path from "path";
import { Engine, LoadResult } from "../engine";
import {
  EngineEventKind,
  stringifyVirtualNode,
  stringifyCSSSheet
} from "paperclip-utils";

export type Graph = {
  [identifier: string]: string;
};

export const createMockEngine = (graph: Graph) =>
  new Engine(
    {
      io: {
        readFile: uri => graph[uri],
        fileExists: uri => Boolean(graph[uri]),
        resolveFile: (from, to) => {
          return path.join(path.dirname(from), to);
        }
      }
    },
    e => {
      console.error(e);
    }
  );

export const waitForError = (engine: Engine) => {
  return new Promise<any>(resolve => {
    engine.onEvent(event => {
      if (event.kind === EngineEventKind.Error) {
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
  const sheetText = [...Object.values(sheets), sheet]
    .map(sheet => {
      return stringifyCSSSheet(sheet, "");
    })
    .join("\n")
    .trim();

  const buffer = `<style>${sheetText}</style>${stringifyVirtualNode(preview)}`;
  return buffer.replace(/[\r\n\t\s]+/g, " ").trim();
};
