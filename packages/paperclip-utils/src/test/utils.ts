import * as path from "path";
import { Engine } from "../engine";


export type Graph = {
  [identifier: string]: string
};

export const createMockEngine = (graph: Graph) => new Engine({
  io: {
    readFile: (uri) => graph[uri],
    fileExists: (uri) => Boolean(graph[uri]),
    resolveFile: (from, to) => {
      return path.join(path.dirname(from), to);
    }
  }
});