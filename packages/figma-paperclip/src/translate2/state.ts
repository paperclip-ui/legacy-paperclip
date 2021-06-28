import { pick } from "lodash";
import { memoize } from "../memo";
import {
  Canvas,
  Config,
  DependencyGraph,
  DependencyKind,
  DesignDependency,
  flattenNodes,
  isVectorLike,
  Node
} from "../state";
import { getLayerStyle } from "../translate/context";

export enum AtomType {
  Color = "Color",
  Shadow = "Shadow",
  Typography = "Typography",
  Asset = "Asset",
  Group = "Group",
  Root = "Root"
}

export enum Category {
  Colors = "Colors",
  Shadows = "Shadows",
  Typography = "Typography"
}

export type BaseAtom<TType extends AtomType> = {
  type: TType;
  name: string;
};

export type Asset = BaseAtom<AtomType.Asset> & {
  value: string;
};

export type Color = BaseAtom<AtomType.Color> & {
  value: string;
};

export type Shadow = BaseAtom<AtomType.Shadow> & {
  value: string;
};

export type Typography = BaseAtom<AtomType.Typography> & {
  properties: Record<string, string>;
};

export type AtomGroup = BaseAtom<AtomType.Group> & {
  children: Atom[];
};

export type AtomRoot = {
  dependencyAtoms: Record<string, Atom>;
};

export type Atom = AtomGroup | Asset | Color | Shadow | Typography;

type GenerateOptions = {
  prefix: string;
};

export const createAtoms = (graph: DependencyGraph, config: Config) => {
  return createAtomRoot(graph, {
    prefix: config.atoms?.prefix || "$"
  });
};

const createAtomRoot = (
  graph: DependencyGraph,
  options: GenerateOptions
): AtomGroup[] => {
  const atoms: AtomGroup[] = [];
  for (const uri in graph) {
    const dep = graph[uri];
    if (dep.kind === DependencyKind.Design) {
      atoms.push(...createAtomsFromDesign(dep, options));
    }
  }
  return atoms;
};

export const createAtomsFromDesign = (
  design: DesignDependency,
  options: GenerateOptions
) => {
  const atoms: AtomGroup[] = [];
  for (const page of design.document.children) {
    atoms.push(...createAtomsFromPage2(page, options));
  }
  return atoms;
};

export const createAtomsFromPage = (page: any, config: Config) =>
  createAtomsFromPage2(page, {
    prefix: config.atoms?.prefix || ""
  });

const createAtomsFromPage2 = (
  page: any,
  options: GenerateOptions
): AtomGroup[] => {
  const atoms: AtomGroup[] = [];
  for (const canvas of page.children) {
    const atom = createAtomFromCanvas(canvas, options);
    if (!atom) {
      continue;
    }

    atoms.push(atom);
  }

  return atoms;
};

const createAtomFromCanvas = (
  canvas: Canvas,
  options: GenerateOptions
): AtomGroup => {
  const category = getCanvasCategory(canvas, options);
  if (!category || !canvas.children) {
    return null;
  }
  return {
    type: AtomType.Group,
    name: category,
    children: createAtomGroupChildren(1, canvas, options)
  };
};

const createAtomGroupChildren = (
  index: number,
  canvas: Canvas,
  options: GenerateOptions
) => {
  const nameParts = getCanvasNameParts(canvas);
  if (index === nameParts.length) {
    return createCanvasAtoms(canvas, options);
  } else {
    return [
      {
        type: AtomType.Group,
        name: nameParts[index],
        children: createAtomGroupChildren(index + 1, canvas, options)
      }
    ];
  }
};

const createCanvasAtoms = (canvas: Canvas, options: GenerateOptions) => {
  return (
    flattenNodes(canvas)
      // first child is the canvas, skip that.
      .slice(1)
      .filter(isAtom(options))
      .map(node => {
        const category = getCanvasCategory(canvas, options);
        const model = getAtomModel(node, category);
        return (
          model &&
          createAtom(
            stripPrefix(node.name, options.prefix),
            getLayerStyle(model),
            category
          )
        );
      })
      .filter(Boolean)
  );
};

const createAtom = (name: string, style: any, category: Category): Atom => {
  switch (category) {
    case Category.Colors: {
      return {
        type: AtomType.Color,
        name,
        value: style.background || "invalid"
      };
    }
    case Category.Shadows: {
      return {
        type: AtomType.Shadow,
        name,
        value: style.boxShadow || "invalid"
      };
    }
    case Category.Typography: {
      return {
        type: AtomType.Typography,
        name,
        properties: pick(
          style,
          "fontFamily",
          "letterSpacing",
          "lineHeight",
          "fontWeight",
          "fontSize",
          "textAlign"
        )
      };
    }
  }
};

const getAtomModel = memoize((node: Node, category: Category) => {
  let filter;
  if (category === Category.Colors || category === Category.Shadows) {
    filter = node => {
      return isVectorLike(node) || node.type === "RECTANGLE";
    };
  } else if (category === Category.Typography) {
    filter = node => {
      return node.type === "TEXT";
    };
  }

  return flattenNodes(node).find(filter);
});

const isAtom = memoize((options: GenerateOptions) =>
  memoize((node: Node) => {
    const name = stripPrefix(node.name, options.prefix);
    return name != null;
  })
);

const getCanvasCategory = memoize(
  (canvas: Node, options: GenerateOptions): Category => {
    const nameParts = getCanvasNameParts(canvas);
    const category =
      Category[maybeTitlecase(stripPrefix(nameParts[0], options.prefix))];
    if (!category) {
      return null;
    }
    return category;
  }
);

const getCanvasNameParts = memoize((canvas: Node) => {
  return canvas.name.toLowerCase().split(/\s*\/\s*/);
});

const stripPrefix = (value: string, prefix: string) => {
  if (value.indexOf(prefix) !== 0) {
    return null;
  }
  return value.substr(prefix.length);
};
const maybeTitlecase = str =>
  str && str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
