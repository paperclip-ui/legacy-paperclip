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
  name: string;
  children: Atom[];
};

export type AtomRoot = BaseAtom<AtomType.Root> & {
  children: Atom[];
};

export type Atom = AtomRoot | AtomGroup | Asset | Color | Shadow | Typography;

type GenerateOptions = {
  prefix: string;
};

export const createAtoms = (
  graph: DependencyGraph,
  config: Config
): AtomRoot => {
  return createAtomRoot(graph, {
    prefix: config.atoms?.prefix || ""
  });
};

const createAtomRoot = (
  graph: DependencyGraph,
  options: GenerateOptions
): AtomRoot => {
  const children: Atom[] = [];
  for (const uri in graph) {
    const dep = graph[uri];
    if (dep.kind === DependencyKind.Design) {
      children.push(...createAtomsFromDesign(dep, options));
    }
  }
  return { type: AtomType.Root, children };
};

const createAtomsFromDesign = (
  design: DesignDependency,
  options: GenerateOptions
) => {
  const atoms: Atom[] = [];
  for (const page of design.document.children) {
    atoms.push(...createAtomsFromPage(page, options));
  }
  return atoms;
};

const createAtomsFromPage = (page: any, options: GenerateOptions) => {
  const atoms: Atom[] = [];
  for (const canvas of page.children) {
    const atom = createAtomFromCanvas(canvas, options);
    if (!atom) {
      continue;
    }

    // atoms.push(createAtomFromCanvas(canvas));
  }

  return atoms;
};

const createAtomFromCanvas = (canvas: Canvas, options: GenerateOptions) => {
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
    return {
      type: AtomType.Group,
      name: nameParts[index],
      children: createAtomGroupChildren(index + 1, canvas, options)
    };
  }
};

const createCanvasAtoms = (canvas: Canvas, options: GenerateOptions) => {
  return canvas.children.filter(isAtom(options)).map(node => {
    return createAtom(node, getCanvasCategory(canvas, options));
  });
};

const createAtom = (node: Node, category: Category) => {
  switch (category) {
    case Category.Colors: {
      return createColorAtom(node);
    }
    case Category.Shadows: {
      return createShadowAsset(node);
    }
    case Category.Typography: {
      return createTypographyAsset(node);
    }
  }
};

const createColorAtom = (node: Node) => {
  const shape = flattenNodes(node).filter(node => {
    return isVectorLike(node) || node.type === "RECTANGLE";
  });
  console.log("COLOR", shape);
};
const createShadowAsset = (node: Node) => {};
const createTypographyAsset = (node: Node) => {};

const isAtom = memoize((options: GenerateOptions) =>
  memoize((node: Node) => {
    return stripPrefix(node.name, options.prefix) != null;
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
