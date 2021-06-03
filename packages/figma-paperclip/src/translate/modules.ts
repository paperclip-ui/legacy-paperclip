import {
  Dependency,
  DependencyGraph,
  DependencyKind,
  DesignDependency,
  DesignFileDesignImport,
  DesignFileImportKind,
  flattenNodes
} from "../state";
import {
  addBuffer,
  addFile,
  endBlock,
  startBlock,
  startFile,
  TranslateContext2
} from "./context";
import { getDesignModulesFile, writeElementBlock } from "./utils";

export const writeDesignModules = (
  dep: DesignDependency,
  context: TranslateContext2
) => {
  context = startFile(getDesignModulesFile(dep), dep.fileKey, context);
  context = writeMixins(dep, context);
  context = addFile(context);
  return context;
};

const writeMixins = (dep: DesignDependency, context: TranslateContext2) => {
  context = writeElementBlock(
    { tagName: "style" },
    context => {
      context = writeMixinsBody(dep, context);
      return context;
    },
    context
  );
  return context;
};

const writeMixinsBody = (dep: DesignDependency, context: TranslateContext2) => {
  for (const mixinId in dep.styles) {
    const mixin = dep.styles[mixinId];
    const modelLayer = getGlobalMixinModelLayer(
      mixinId,
      dep.fileKey,
      context.graph
    );
  }
  return context;
};

const writeStyleBlock = (
  selector: string,
  writeBody: (context: TranslateContext2) => TranslateContext2,
  context: TranslateContext2
) => {
  context = addBuffer(`${selector} {\n`, context);
  context = startBlock(context);
  context = writeBody(context);
  context = endBlock(context);
  context = addBuffer(`}\n`, context);
  return context;
};

const getGlobalMixinModelLayer = (
  mixinId: string,
  originFileKey: string,
  graph: DependencyGraph
) => {
  const origin = graph[originFileKey] as DesignDependency;
  const modelLayer = getDepMixinModelLayer(mixinId, origin);
  if (modelLayer) {
    return modelLayer;
  }
  // if not found, then need to look in other places where it is used. Note
  // that this may be problematic if the designer doesn't publish their designs. Maybe have linting if there's inconsistency?
  for (const filekKey in graph) {
    const dep = graph[filekKey];
    if (dep.kind === DependencyKind.DesignFile) {
      const impId = getDependentImportId(originFileKey, dep);
      if (impId) {
        const imp = dep.imports[impId] as DesignFileDesignImport;
        const depModelLayer = getDepMixinModelLayer(impId, dep);
        if (depModelLayer) {
          return depModelLayer;
        }
      }
    }
  }
};

const getDepMixinModelLayer = (styleId: string, dep: DesignDependency) => {
  return flattenNodes(dep.document).find((layer: any) => {
    return layer.styles && Object.values(layer.styles).includes(styleId);
  });
};

const getDependentImportId = (importFileKey: string, dep: DesignDependency) => {
  for (const refId in dep.imports) {
    const imp = dep.imports[refId];
    if (imp.fileKey === importFileKey) {
      return refId;
    }
  }
  return null;
};
