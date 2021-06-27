import { writeFile } from "fs-extra";
import { kebabCase } from "lodash";
import { DependencyGraph, DependencyKind, DesignDependency } from "../state";
import { addBuffer } from "../translate/context";
import {
  getDesignPageFile,
  getPageAtomsFile,
  writeElementBlock,
  writeStyleBlock,
  writeStyleDeclaration,
  writeStyleDeclarations
} from "../translate/utils";
import { addFile, startFile, TranslateContext2 } from "./context";
import {
  Atom,
  AtomGroup,
  AtomType,
  Category,
  createAtoms,
  createAtomsFromPage
} from "./state";

export const writePages = (
  graph: DependencyGraph,
  context: TranslateContext2
) => {
  for (const uri in graph) {
    const dep = graph[uri];
    if (dep.kind === DependencyKind.Design) {
      context = writeDesign(dep, graph, context);
    }
  }
  // context = startFile("atoms.pc", null, context);
  // context = writeAtomStyleBlock(graph, context);
  // context = addFile(context);
  return context;
};
const writeDesign = (
  dep: DesignDependency,
  graph: DependencyGraph,
  context: TranslateContext2
) => {
  for (const page of dep.document.children) {
    context = writePage(page, dep, graph, context);
  }
  return context;
};

const writePage = (
  page: any,
  dep: DesignDependency,
  graph: DependencyGraph,
  context: TranslateContext2
) => {
  const atomGroups = createAtomsFromPage(page, context.options.config);

  if (!atomGroups.length) {
    return context;
  }

  context = startFile(getPageAtomsFile(page, dep), dep.fileKey, context);
  context = writeAtomStyleBlock(atomGroups, context);
  context = addFile(context);
  return context;
};

const writeAtomStyleBlock = (atomGroups: any, context: TranslateContext2) => {
  context = writeElementBlock(
    { tagName: "style" },
    context => {
      for (const atom of atomGroups) {
        context = writeAtomGroup(atom, context);
      }
      return context;
    },
    context
  );
  return context;
};

const writeAtomGroup = (group: AtomGroup, context: TranslateContext2) => {
  const category = group.name as Category;
  let selector;
  if (category === Category.Colors) {
    selector = ":root";
    if (context.options.config.atoms?.globalVars) {
      selector = `:global(${selector})`;
    }
  } else {
    selector = "@export";
  }

  context = writeStyleBlock(
    selector,
    context => {
      for (const child of group.children) {
        context = writeAtom(0, category, child, context);
      }
      return context;
    },
    context
  );

  context = addBuffer("\n", context);

  return context;
};

const writeAtom = (
  depth: number,
  category: string,
  atom: Atom,
  context: TranslateContext2
) => {
  switch (atom.type) {
    case AtomType.Group: {
      let selector = "." + kebabCase(atom.name);
      if (depth > 0) {
        selector = "&" + selector;
      }
      return writeStyleBlock(
        selector,
        context => {
          return atom.children.reduce(
            (context, child) => writeAtom(depth + 1, category, child, context),
            context
          );
        },
        context
      );
    }
    case AtomType.Color: {
      return writeStyleDeclaration(
        `--color-${kebabCase(atom.name)}`,
        atom.value,
        context,
        false
      );
    }
    case AtomType.Shadow: {
      return writeStyleDeclaration(
        `--shadow-${kebabCase(atom.name)}`,
        atom.value,
        context,
        false
      );
    }
    case AtomType.Typography: {
      context = writeStyleBlock(
        "." + kebabCase(atom.name),
        context => {
          return writeStyleDeclarations(atom.properties, context);
        },
        context
      );

      context = writeStyleBlock(
        "@mixin " + kebabCase(atom.name),
        context => {
          return writeStyleDeclarations(atom.properties, context);
        },
        context
      );

      return context;
    }
  }
  return context;
};
