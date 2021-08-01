import {
  Sheet,
  LoadedData,
  memoize,
  SourceLocation,
  traverseExpression,
  DependencyContent,
  Node,
  NodeKind,
  traverseSheet,
  Element,
  isStyleDeclaration,
  KeyValueDeclaration,
  StyleDeclarationKind,
  DependencyContentKind,
  DependencyGraph,
  isComponent,
  isRule,
  StyleRule,
  RuleKind,
  KeyframeRule,
  MixinRule,
  KeyframesRule,
  getChildren,
  isImport,
  getAttribute,
  Dependency
} from "paperclip-utils";
import { CSS_COLOR_NAME_REGEXP } from "./css-color-names";
import * as parseColor from "color";
const EMPTY_ARRAY = [];

type Color = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

type ColorInfo = {
  value: Color;
  location: SourceLocation;
};

type DocumentInfo = {
  colors: ColorInfo[];
};

export const collectASTInfo = (
  entryUri: string,
  graph: DependencyGraph,
  evaluated: Record<string, LoadedData>
) => {
  const map = {
    colors: getDocumentColors(entryUri, graph, evaluated)
  };

  return map;
};

const getDocumentColors = (
  uri: string,
  asts: DependencyGraph,
  evaluated: Record<string, LoadedData>
) => {
  const documentAST = asts[uri];
  const { declarations } = getDocumentASTInfo(documentAST.content);
  const colors: ColorInfo[] = [];
  const allVariables = getAllDocumentVariables(uri, asts);

  for (const declaration of declarations) {
    addDeclarationColors(declaration, colors, allVariables);
  }
  return colors;
};

const getAllDocumentVariables = (uri: string, graph: DependencyGraph) => {
  const entry = graph[uri];
  const allVariables: Record<string, KeyValueDeclaration> = {
    ...getDocumentVariables(entry.content)
  };
  for (const relPath in entry.dependencies) {
    const dep = graph[entry.dependencies[relPath]];
    Object.assign(
      allVariables,
      getDocumentVariables(dep.content),
      allVariables
    );
  }
  return allVariables;
};

const getDocumentVariables = memoize((data: DependencyContent) => {
  const { declarations } =
    data.contentKind === DependencyContentKind.Node
      ? getNodeASTInfo(data)
      : getSheetASTInfo(data);
  const variables: Record<string, KeyValueDeclaration> = {};
  for (const decl of declarations) {
    if (decl.name.startsWith("--")) {
      variables[decl.name] = decl;
    }
  }

  return variables;
});

const collectStyleSheetInfo = (ast: Sheet, colors: ColorInfo[]) => {
  const { declarations } = getSheetASTInfo(ast);
};

const getSheetASTInfo = memoize((ast: Sheet) => {
  const declarations: KeyValueDeclaration[] = [];
  const keyframes: KeyframesRule[] = [];
  const mixins: MixinRule[] = [];

  traverseSheet(ast, expr => {
    if (
      isStyleDeclaration(expr) &&
      expr.declarationKind === StyleDeclarationKind.KeyValue
    ) {
      declarations.push(expr);
    }
    if (isRule(expr)) {
      if (expr.ruleKind === RuleKind.Keyframes) {
        keyframes.push(expr);
      } else if (expr.ruleKind === RuleKind.Mixin) {
        mixins.push(expr);
      }
    }
  });

  return { declarations, keyframes, mixins };
});

const getDocumentASTInfo = (content: DependencyContent) =>
  content.contentKind === DependencyContentKind.Node
    ? getNodeASTInfo(content)
    : getSheetASTInfo(content);

const getPCDocumentImports = (content: Node) => {
  return getChildren(content).filter(isImport) as Element[];
};

const getNodeASTInfo = memoize((node: Node) => {
  const allDecls: KeyValueDeclaration[] = [];
  const allComponents: Element[] = [];
  const allKeyframes: KeyframesRule[] = [];
  const allMixins: MixinRule[] = [];

  traverseExpression(node, (node: Node) => {
    if (node.nodeKind === NodeKind.StyleElement) {
      const { declarations, mixins, keyframes } = getSheetASTInfo(node.sheet);
      allDecls.push(...declarations);
      allMixins.push(...mixins);
      allKeyframes.push(...keyframes);
    }
    if (isComponent(node)) {
      allComponents.push(node);
    }
  });

  return {
    declarations: allDecls,
    components: allComponents,
    keyframes: allKeyframes,
    mixins: allMixins
  };
});

const addDeclarationColors = (
  decl: KeyValueDeclaration,
  allColors: ColorInfo[],
  variables: Record<string, KeyValueDeclaration>
) => {
  const colors =
    matchColor(decl.value) || decl.value.match(/#[^\s,;]+|(var)\(.*?\)/g) || [];

  let modelDecl = decl.value;

  for (const color of colors) {
    let colorValue;
    if (/var\(.*?\)/.test(color)) {
      const name = color.match(/var\((.*?)\)/)[1];
      const varDecl = variables[name];

      if (varDecl) {
        const match = matchColor(varDecl.value);
        if (match) {
          colorValue = match[0];
        }
      }
    } else {
      colorValue = color;
    }

    if (!colorValue) {
      continue;
    }

    const colorIndex = modelDecl.indexOf(color);

    // ensure that color isn't there in case there is another instance
    // in the string -- want to go through each one.
    modelDecl = modelDecl.replace(color, "_".repeat(color.length));

    const colorStart = decl.valueLocation.start + colorIndex;

    try {
      const {
        color: [red, green, blue],
        valpha: alpha
      } = parseColor(colorValue);

      allColors.push({
        value: { red, green, blue, alpha },
        location: { start: colorStart, end: colorStart + color.length }
      });
    } catch (e) {}
  }
};

const matchColor = (value: string) => {
  return (
    value.match(/#[a-zA-Z0-9]+|(rgba|rgb|hsl|hsla|var)\(.*?\)/g) ||
    value.match(CSS_COLOR_NAME_REGEXP)
  );
};
