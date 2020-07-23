import * as path from "path";
import { createEngine } from "../../";
import {
  EngineEventKind,
  stringifyVirtualNode,
  stringifyCSSSheet
} from "paperclip-utils";
export const TEST_FIXTURE_DIRECTORY = path.join(
  __dirname,
  "../../test-fixtures"
);
export const createMockEngine = (
  graph,
  onErr = e => console.error(e),
  io = {}
) =>
  createEngine(
    {
      io: Object.assign(
        {
          readFile: uri => graph[uri],
          fileExists: uri => Boolean(graph[uri]),
          resolveFile: (from, to) => {
            return path.join(path.dirname(from), to).replace(/\\/g, "/");
          }
        },
        io
      )
    },
    onErr
  );
export const waitForError = (engine, test = () => true) => {
  return new Promise(resolve => {
    engine.onEvent(event => {
      if (event.kind === EngineEventKind.Error && test(event)) {
        resolve(event);
      }
    });
  });
};
export const waitForRender = (engine, test = () => true) => {
  return new Promise(resolve => {
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
}) => {
  const sheetText = [...sheets.map(({ sheet }) => sheet), sheet]
    .map(sheet => {
      return stringifyCSSSheet(sheet, "");
    })
    .join("\n")
    .trim();
  const buffer = `<style>${sheetText}</style>${stringifyVirtualNode(preview)}`;
  return cleanHTML(buffer);
};
export const cleanHTML = value => {
  return value.replace(/[\r\n\t\s]+/g, " ").trim();
};
// eslint-disable-next-line
export const noop = () => {};
