import { DependencyGraph, DependencyKind } from "../state";
import {
  addBuffer,
  addFile,
  createContext2,
  startFile,
  TranslateContext2,
  TranslateOptions
} from "./context";
import { getFontFile } from "./utils";
import { writeDesignModules } from "./modules";
import { writeDesignPages } from "./pages";

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

  context = writeFonts(context);

  // previews are private and should not be directly referenced
  context = writeDesigns(context);

  return context.files;
};

const writeDesigns = (context: TranslateContext2) => {
  for (const fileKey in context.graph) {
    const dep = context.graph[fileKey];
    if (dep.kind === DependencyKind.Design) {
      context = writeDesignModules(dep, context);
      context = writeDesignPages(dep, context);
    }
  }

  return context;
};

const writeFonts = (context: TranslateContext2) => {
  for (const key in context.graph) {
    const dep = context.graph[key];

    // content may be NULL if there is an error
    if (dep.kind !== DependencyKind.Font || !dep.content) {
      continue;
    }

    context = startFile(getFontFile(dep), dep.fileKey, context);
    context = addBuffer(dep.content, context);
    context = addFile(context);
  }

  return context;
};
