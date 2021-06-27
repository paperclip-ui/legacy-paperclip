import {
  DependencyGraph,
  DependencyKind,
  getNodeById,
  getNodeDependencyById
} from "../state";
import { startFile } from "../translate/context";
import { getLayerMediaPath } from "../translate/utils";
import { writePages } from "./pages";
import {
  addRemoteFile,
  createContext2,
  TranslateContext2,
  TranslateOptions
} from "./context";

export const translateFigmaGraph2 = (
  graph: DependencyGraph,
  options: TranslateOptions
) => {
  let context = createContext2(graph, options);
  context = writePages(graph, context);
  context = writeMedia(context);
  return context.files;
};

const writeMedia = (context: TranslateContext2) => {
  for (const key in context.graph) {
    const dep = context.graph[key];
    if (dep.kind === DependencyKind.Media) {
      const nodeDep = getNodeDependencyById(dep.nodeId, context.graph);
      const node = getNodeById(dep.nodeId, nodeDep.document);
      context = startFile(
        getLayerMediaPath(node, nodeDep, dep.settings),
        key,
        context
      );
      context = addRemoteFile(dep.url, context);
    }
  }
  return context;
};
