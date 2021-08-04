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
  Dependency,
  DependencyNodeContent,
  getAttributeValue,
  getAttributeStringValue,
  AttributeValueKind
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

type DocumentLinkInfo = {
  uri: string;
  location: SourceLocation;
};

export type DefinitionInfo = {
  sourceUri: string;
  instanceLocation: SourceLocation;
  sourceLocation: SourceLocation;
  sourceDefinitionLocation: SourceLocation;
};

const EMPTY = {
  colors: [],
  links: [],
  definitions: []
};

export const collectASTInfo = (
  entryUri: string,
  graph: DependencyGraph,
  evaluated: Record<string, LoadedData>
) => {
  if (!graph[entryUri]) {
    return EMPTY;
  }

  try {
    const map = {
      colors: getDocumentColors(entryUri, graph, evaluated),
      links: getDocumentLinks(entryUri, graph),
      definitions: getDocumentDefinitions(entryUri, graph)
    };
    return map;
  } catch (e) {
    console.error(e);
    return EMPTY;
  }
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

const getDocumentLinks = (
  uri: string,
  asts: DependencyGraph
): DocumentLinkInfo[] => {
  const documentAST = asts[uri];

  if (documentAST.content.contentKind !== DependencyContentKind.Node) {
    return [];
  }

  const links: DocumentLinkInfo[] = [];

  const imports = getImportMap(documentAST.content);

  for (const importId in imports) {
    const imp = imports[importId];
    const src = getAttributeValue("src", imp);
    if (src?.attrValueKind !== AttributeValueKind.String) {
      continue;
    }
    links.push({
      uri: asts[uri].dependencyUriMaps[src.value],
      location: src.location
    });
  }

  return links;
};

const getDocumentDefinitions = (uri: string, graph: DependencyGraph) => {
  const dependency = graph[uri];

  if (dependency.content.contentKind !== DependencyContentKind.Node) {
    return;
  }

  const definitions: DefinitionInfo[] = [];

  const { instances } = getNodeASTInfo(dependency.content);

  for (const instance of instances) {
    const [instanceUri, component] = getInstanceComponentInfo(
      instance,
      uri,
      graph
    );

    if (component) {
      definitions.push({
        sourceUri: instanceUri,
        sourceLocation: component.location,
        sourceDefinitionLocation: component.location,
        instanceLocation: instance.tagNameLocation
      });
    }
  }

  return definitions;
};

const getInstanceComponentInfo = (
  instance: Element,
  uri: string,
  graph: DependencyGraph
): [string, Element] => {
  const entry = graph[uri];

  const components = getComponentMap(entry.content as DependencyNodeContent);

  if (components[instance.tagName]) {
    const component = components[instance.tagName];

    return [uri, component];
  } else {
    const parts = instance.tagName.split(".");
    const depUri = entry.dependencies[parts.shift()];
    const dep = graph[depUri];
    const component = getComponentMap(dep.content as DependencyNodeContent)[
      parts.shift() || "default"
    ];
    return [depUri, component];
  }
};

const getAllDocumentVariables = (uri: string, graph: DependencyGraph) => {
  const entry = graph[uri];
  const allVariables: Record<string, KeyValueDeclaration> = {
    ...getDocumentVariables(entry.content)
  };

  for (const relPath in entry.dependencyUriMaps) {
    const dep = graph[entry.dependencyUriMaps[relPath]];
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

const getDocumentComponents = (root: Node) =>
  (root.nodeKind === NodeKind.Fragment ? root.children : [root]).filter(
    isComponent
  );

const getComponentMap = memoize(
  (root: Node): Record<string, Element> =>
    getDocumentComponents(root).reduce((map, element) => {
      map[getAttributeStringValue("as", element)] = element;
      return map;
    }, {})
);

const getImportMap = memoize(
  (root: Node): Record<string, Element> =>
    getPCDocumentImports(root).reduce((map, element) => {
      map[getAttributeStringValue("as", element)] = element;
      return map;
    }, {})
);

const getNodeASTInfo = memoize((root: Node) => {
  const allDecls: KeyValueDeclaration[] = [];
  const allComponents: Element[] = [];
  const allKeyframes: KeyframesRule[] = [];
  const allMixins: MixinRule[] = [];
  const instances: Element[] = [];

  const components = getComponentMap(root);
  const imports = getImportMap(root);

  traverseExpression(root, (node: Node) => {
    if (node.nodeKind === NodeKind.StyleElement) {
      const { declarations, mixins, keyframes } = getSheetASTInfo(node.sheet);
      allDecls.push(...declarations);
      allMixins.push(...mixins);
      allKeyframes.push(...keyframes);
    }
    if (isComponent(node)) {
      allComponents.push(node);
    }

    if (node.nodeKind === NodeKind.Element) {
      if (components[node.tagName]) {
        instances.push(node);
      } else {
        const nameParts = node.tagName.split(".");
        if (imports[nameParts[0]]) {
          instances.push(node);
        }
      }
    }
  });

  return {
    declarations: allDecls,
    components: allComponents,
    keyframes: allKeyframes,
    mixins: allMixins,
    instances
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
