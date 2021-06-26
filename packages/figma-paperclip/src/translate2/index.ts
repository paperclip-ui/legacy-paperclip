import { DependencyGraph } from "../state";
import { createContext2, TranslateOptions } from "./context";
import { createAtoms } from "./state";

export const translateFigmaGraph2 = (
  graph: DependencyGraph,
  options: TranslateOptions
) => {
  const context = createContext2(graph, options);
  const atoms = createAtoms(graph, options.config);

  // 1. Collect asset informationsl
  // 1. Write atoms
  // 2. Write assets

  return context.files;
};
