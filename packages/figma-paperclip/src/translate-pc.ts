import { DependencyGraph, DependencyKind, FontDependency } from "./state";
import {
  addBuffer,
  addFile,
  createContext2,
  TranslateContext2,
  TranslateOptions
} from "./translate-utils";

/*

Generates design files with the following folder structure:

atoms.pc
figma/
  atoms/
    colors.pc
    typography.pc
    shadows.pc
  assets/
    something.svg
  designs/
    my-design-file-name/
      page1.pc
      page2.pc
    components/
      page.pc
      page2.pc
    onboarding-activation/
      dev-ready-version-2.pc


pseudocode:

<import src="@captec/design/"
*/

export const translateFigmaGraph = (
  graph: DependencyGraph,
  options: TranslateOptions
) => {
  let context = createContext2(graph, options);
  context = translateAtoms(graph, context);
  context = translatePreviews(graph, context);

  return context.files;
};

const translateAtoms = (graph: DependencyGraph, context: TranslateContext2) => {
  context = translateFonts(graph, context);
  return context;
};

const translatePreviews = (
  graph: DependencyGraph,
  context: TranslateContext2
) => {
  return context;
};

const translateFonts = (graph: DependencyGraph, context: TranslateContext2) => {
  for (const key in graph) {
    const dep = graph[key];

    // content may be NULL if there is an error
    if (dep.kind !== DependencyKind.Font || !dep.content) {
      continue;
    }

    context = addBuffer(dep.content, context);
    context = addFile(getFontFile(dep), context);
  }

  return context;
};

const getFontFile = (dep: FontDependency) => `atoms/${dep.fileKey}.pc`;
