import {
  Config,
  DependencyGraph,
  DependencyKind,
  DesignDependency,
  DesignFileDesignImport,
  extractMixedInStyles,
  flattenNodes
} from "../state";
import { logWarn } from "../utils";
import {
  addBuffer,
  addFile,
  endBlock,
  startBlock,
  startFile,
  TranslateContext2
} from "./context";
import {
  getDesignModulesFile,
  getMixinValue,
  getMixinName,
  isStyleVar,
  writeElementBlock,
  writeStyleBlock,
  writeStyleDeclaration,
  writeStyleDeclarations
} from "./utils";
import * as chalk from "chalk";
import { memoize } from "../memo";

export const writeDesignModules = (
  dep: DesignDependency,
  context: TranslateContext2
) => {
  context = startFile(getDesignModulesFile(dep), dep.fileKey, context);
  context = writeAtoms(dep, context);
  context = addFile(context);
  return context;
};

const writeAtoms = (dep: DesignDependency, context: TranslateContext2) => {
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
  const { vars, mixins } = getAtoms(
    dep,
    context.graph,
    context.options.config
  ) as any;
  context = writeStyleBlock(
    "@export",
    context => {
      context = writeVars(vars, context);
      context = writeMixins(mixins, context);
      return context;
    },
    context
  );
  return context;
};

const writeVars = (
  vars: Record<string, string>,
  context: TranslateContext2
) => {
  let selector = ":root";

  if (context.options.config.atoms?.globalVars) {
    selector = `:global(${selector})`;
  }

  return writeStyleBlock(
    selector,
    context => {
      for (const name in vars) {
        context = writeStyleDeclaration(name, vars[name], context, false);
      }
      return context;
    },
    context
  );
};

const writeMixins = (
  mixins: Record<string, Record<string, string>>,
  context: TranslateContext2
) => {
  for (const name in mixins) {
    context = writeStyleBlock(
      `@mixin ${name}`,
      context => {
        return writeStyleDeclarations(mixins[name], context);
      },
      context
    );

    context = writeStyleBlock(
      `.${name}`,
      context => {
        return writeStyleDeclarations(mixins[name], context);
      },
      context
    );
  }
  return context;
};

export const getAtoms = memoize(
  (dep: DesignDependency, graph: DependencyGraph, config: Config) => {
    const vars = {};
    const mixins = {};

    for (const mixinId in dep.styles) {
      const mixin = dep.styles[mixinId];
      const modelLayer = getGlobalMixinModelLayer(mixinId, dep.fileKey, graph);

      if (!modelLayer) {
        logWarn(`Could not find styles for "${chalk.bold(mixin.name)}"`);
        continue;
      }

      const style = extractMixedInStyles(modelLayer)[mixinId];

      // should be grid
      if (!style) {
        continue;
      }

      const name = getMixinName(mixin, config);
      const value = getMixinValue(mixin, style);

      if (isStyleVar(mixin)) {
        vars[name] = value;
      } else {
        mixins[name] = value;
      }
    }

    return { vars, mixins };
  }
);

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
    if (dep.kind === DependencyKind.Design) {
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
