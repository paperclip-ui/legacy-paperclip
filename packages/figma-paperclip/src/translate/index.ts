import {
  DependencyGraph,
  DependencyKind,
  getNodeById,
  getNodeDependency,
  getNodeDependencyById,
  getNodeExportFileName
} from "../state";
import {
  addBuffer,
  addFile,
  addRemoteFile,
  createContext2,
  startFile,
  TranslateContext2,
  TranslateOptions
} from "./context";
import { getFontFile, getLayerMediaPath } from "./utils";
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

  context = writeMedia(context);

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
