// inspired by https://github.com/KarlRombauts/Figma-SCSS-Generator/blob/master/gradients.js
// https://github.com/figma/figma-api-demo/blob/533d556c853fad731f65c5c264dd8adc0eaf1b1b/figma-to-react/lib/figma.js
import {
  createTranslateContext,
  TranslateContext,
  addBuffer,
  startBlock,
  endBlock
} from "./translate-utils";
import {
  Node,
  NodeType,
  Text,
  getUniqueNodeName,
  RadialGradient,
  LinearGradient,
  Vector,
  hasChildren,
  Document,
  FrameProps,
  cleanupNodeId,
  getNodeById,
  getAllTextNodes,
  Color,
  FillType,
  Fill,
  SolidFill,
  VectorNodeProps,
  BaseNode,
  Effect,
  ImageFill,
  getNodeExportFileName,
  Component,
  getNodePath,
  getNodeByPath,
  Instance,
  hasVectorProps,
  CompilerOptions,
  getOwnerComponent,
  DependencyMap,
  isVectorLike,
  getAllComponents,
  DependencyGraph,
  Dependency2,
  ComponentSet,
  containsNode,
  getNodeParent,
  getAllComponentSets
} from "./state";
import { pascalCase, logWarn } from "./utils";
import * as chalk from "chalk";
import * as path from "path";
import { camelCase, pick, omit } from "lodash";
import { DEFAULT_EXPORT_SETTINGS } from "./constants";
import { memoize } from "./memo";
import { uniq } from "lodash";

export const translateFigmaProjectToPaperclip = (
  filePath: string,
  graph: DependencyGraph,
  compilerOptions: CompilerOptions,
  fontPaths: string[]
) => {
  const entry = graph[filePath];

  let context = createTranslateContext(
    filePath,
    compilerOptions,
    graph,
    fontPaths
  );

  context = addBuffer(`\n<!--\n`, context);
  context = startBlock(context);
  context = addBuffer(`!! AUTO GENERATED, EDIT WITH CAUTION !!\n`, context);
  context = endBlock(context);
  context = addBuffer(`-->\n\n`, context);
  context = translateImports(context);

  context = addBuffer(`<!-- STYLES -->\n\n`, context);
  context = translateStyles(entry.document, context);

  context = addBuffer(`<!-- ALL LAYERS & COMPONENTS -->\n\n`, context);
  context = translateComponents(context);

  if (compilerOptions.includePreviews !== false) {
    context = addBuffer(`<!-- PREVIEWS -->\n\n`, context);
    context = translatePreviews(entry.document, context);
    // context = translatePreviews2(entry.document, context);
  }
  return context.buffer;
};

const translateImports = (context: TranslateContext) => {
  const importFilePaths = getImportFilePaths(context);
  for (const fontPath of context.fontPaths) {
    context = addBuffer(`<import src="./${fontPath}" />\n`, context);
  }
  for (let i = 0, { length } = importFilePaths; i < length; i++) {
    const filePath = importFilePaths[i];
    let relativePath = path.relative(
      path.dirname(context.entryFilePath),
      filePath
    );

    if (relativePath.charAt(0) !== ".") {
      relativePath = "./" + relativePath;
    }
    context = addBuffer(
      `<import as="module${i}" src="${relativePath}" />\n`,
      context
    );
  }

  context = addBuffer(`\n`, context);

  return context;
};

const getImportFilePaths = (context: TranslateContext) => {
  const entry = context.graph[context.entryFilePath];
  return uniq(
    Object.keys(entry.imports).map(refId => {
      return entry.imports[refId].filePath;
    })
  );
};

const getNodeDocument = (node: Node, graph: DependencyGraph) => {
  return getNodeDependency(node, graph).document;
};

const getNodeDependency = (node: Node, graph: DependencyGraph) => {
  return graph[getNodeSourceFilePath(node, graph)];
};

// const getNode = (
//   id: string,
//   entryFilePath: string,
//   graph: DependencyGraph
// ): Component => {
//   return getNodeById(
//     // TODO - will need to replace component alias
//     id,
//     getNodeDocument(id, graph)
//   ) as Component;
// };

const getComponentById = (
  componentId: string,
  dependency: Dependency2,
  graph: DependencyGraph
): Component => {
  const entry = graph[dependency.filePath];
  const imp = entry.imports[componentId];

  if (imp) {
    return getNodeById(imp.nodeId, graph[imp.filePath].document) as Component;
  }

  return getNodeById(componentId, dependency.document) as Component;
};

const getNodeSourceFilePath = memoize(
  (node: Node, graph: DependencyGraph): string => {
    for (const filePath in graph) {
      const dep = graph[filePath];
      if (containsNode(node, dep.document)) {
        return filePath;
      }
    }
    return null;
  }
);

const getImportedComponentModuleName = (
  component: Component,
  context: TranslateContext
) => {
  return `module${getImportFilePaths(context).indexOf(
    getNodeSourceFilePath(component, context.graph)
  )}`;
};

const translateComponents = (context: TranslateContext) => {
  const allComponents = getAllComponents(
    context.graph[context.entryFilePath].document
  );
  for (const component of allComponents) {
    context = translateComponent(component, context);
  }
  return context;
};

const translateComponent = (node: Node, context: TranslateContext) => {
  if (
    node.type === NodeType.Document ||
    node.type === NodeType.Canvas ||
    node.type === NodeType.Instance
  ) {
    return context;
  }

  const document = context.graph[context.entryFilePath].document;

  const componentName = getNodeComponentName(node, document);

  if (node.exportSettings && node.exportSettings.length) {
    context = addBuffer(
      `<img export component as="${componentName}" src="./${getNodeExportFileName(
        node,
        document,
        node.exportSettings[0]
      )}" className="${getNodeClassName(node, context)} {className?}">\n\n`,
      context
    );

    context = startBlock(context);
    context = translateInlineStyle(node, context);
    context = endBlock(context);
    context = addBuffer(`</img>\n\n`, context);

    return context;
  }

  if (isVectorLike(node)) {
    context = addInvisibleFrame(context);
    context = addBuffer(
      `<div export component as="${componentName}" className="${getNodeClassName(
        node,
        context
      )} {className?}" width="${node.size.x}" height="${node.size.y}">\n`,
      context
    );
    context = startBlock(context);
    context = translateInlineStyle(node, context);
    context = endBlock(context);
    context = addBuffer(`</div>\n\n`, context);
  } else {
    const tagName = node.type === NodeType.Text ? `span` : `div`;
    context = addInvisibleFrame(context);
    context = addBuffer(
      `<${tagName} export component as="${componentName}" className="${getNodeClassName(
        node,
        context
      )} {className?}">\n`,
      context
    );
    context = startBlock(context);
    context = translateInlineStyle(node, context);
    context = addBuffer(`{children}\n`, context);
    context = endBlock(context);
    context = addBuffer(`</${tagName}>\n\n`, context);
  }

  if (hasChildren(node)) {
    for (const child of node.children) {
      context = translateComponent(child, context);
    }
  }
  return context;
};

const translateInlineStyle = (node: Node, context: TranslateContext) => {
  const [layoutStyle, otherStyle] = splitLayoutStyle(
    getNodeStyle(node, context)
  );

  if (!Object.keys(otherStyle).length && !Object.keys(layoutStyle).length) {
    return context;
  }

  context = addBuffer(`<style>\n`, context);
  context = startBlock(context);
  context = addBuffer(`box-sizing: border-box;\n`, context);
  for (const key in otherStyle) {
    context = addBuffer(`${key}: ${otherStyle[key]};\n`, context);
  }
  if (Object.keys(layoutStyle).length) {
    context = addBuffer(
      `&:within(.absolute-position), &.absolute-position {\n`,
      context
    );
    context = startBlock(context);
    for (const key in layoutStyle) {
      context = addBuffer(`${key}: ${layoutStyle[key]};\n`, context);
    }
    context = endBlock(context);
    context = addBuffer(`}\n`, context);
  }

  context = endBlock(context);
  context = addBuffer(`</style>\n`, context);
  return context;
};

const addInvisibleFrame = (context: TranslateContext) => {
  context = addBuffer(`<!--\n`, context);
  context = startBlock(context);
  context = addBuffer(`@frame { visible: false }\n`, context);
  context = endBlock(context);
  context = addBuffer(`-->\n`, context);
  return context;
};

const VISIBLE_FRAME_PADDING = 20;

const addVisibleFrame = (context: TranslateContext, node: any) => {
  const start = context.currentFrameX + VISIBLE_FRAME_PADDING;

  context = addBuffer(`<!--\n`, context);
  context = startBlock(context);
  context = addBuffer(
    `@frame { title: ${JSON.stringify(node.name)}, x: ${Math.round(
      node.absoluteBoundingBox.x
    )}, y: ${Math.round(node.absoluteBoundingBox.y)}, width: ${Math.round(
      node.absoluteBoundingBox.width
    )}, height: ${Math.round(node.absoluteBoundingBox.height)} }\n`,
    context
  );
  context = endBlock(context);
  context = addBuffer(`-->\n`, context);
  return context;
};

const translatePreviews = (document: Document, context: TranslateContext) => {
  const canvas = document.children[0];

  if (!hasChildren(canvas)) {
    return context;
  }

  const allComponents = getAllComponents(document);

  for (const component of allComponents) {
    context = translateComponentPreview(component, document, context);
    context = translatePreview(component, context);
    context = addBuffer(`\n`, context);
  }

  return context;
};

const getPreviewComponentName = (
  component: Component,
  context: TranslateContext
) => {
  const entry = context.graph[context.entryFilePath];

  const nodeName = getUniqueNodeName(
    component,
    getNodeDocument(component, context.graph)
  );

  let name =
    "_Preview_" + pascalCase(nodeName + "_" + cleanupNodeId(component.id));

  if (!containsNode(component, entry.document)) {
    name = getImportedComponentModuleName(component, context) + "." + name;
  }

  return name;
};

const translateComponentPreview = (
  node: Component,
  document: Document,
  context: TranslateContext
) => {
  // Note that previews are exported so that they can be used in other component files.

  context = addInvisibleFrame(context);
  context = addBuffer(
    `<${getNodeComponentName(
      node,
      document
    )} export component as="${getPreviewComponentName(
      node,
      context
    )}" {className}`,
    context
  );

  context = addBuffer(`>\n`, context);
  context = startBlock(context);
  context = translateInlineStyle(node, context);
  context = endBlock(context);
  context = translatePreviewChildren(node, context, true);
  context = addBuffer(
    `</${getNodeComponentName(node, document)}>\n\n`,
    context
  );

  return context;
};

const translatePreview = (
  node: Node,
  context: TranslateContext,
  inComponent?: boolean
) => {
  const dependency = getNodeDependency(node, context.graph);
  if (node.type === NodeType.Instance || node.type === NodeType.Component) {
    context = translateInstancePreview(
      node,
      node.type === NodeType.Instance
        ? getComponentById(node.componentId, dependency, context.graph)
        : node,
      context,
      inComponent
    );
  } else {
    context = addBuffer(
      `<${getNodeComponentName(node, dependency.document)}`,
      context
    );

    context = addBuffer(`>\n`, context);
    context = translatePreviewChildren(node, context, inComponent);
    context = addBuffer(
      `</${getNodeComponentName(node, dependency.document)}>\n`,
      context
    );
  }
  return context;
};

const translatePreviewChildren = (
  node: Node,
  context: TranslateContext,
  inComponent?: boolean
) => {
  const document = getNodeDocument(node, context.graph);
  context = startBlock(context);
  if (node.type === NodeType.Text) {
    if (inComponent) {
      context = addBuffer(
        `{${getUniqueNodeName(node, document)}_text}\n`,
        context
      );
    } else {
      context = addBuffer(
        `${translateTextCharacters(node.characters)}\n`,
        context
      );
    }
  } else if (hasChildren(node)) {
    for (const child of node.children) {
      context = translatePreview(child, context, inComponent);
    }
  }
  context = endBlock(context);
  return context;
};

const translateTextCharacters = (characters: string) => {
  return characters.replace(/[\n\r]+/g, " <br /> ");
};

const getInstanceSourceNode = (
  descendent: Node,
  instance: Node,
  component: Component,
  context: TranslateContext
) => {
  const nodePath = getNodePath(descendent, instance);
  return getNodeByPath(nodePath, component);
};

const getPrevNode = memoize((nextNode: Node, graph: DependencyGraph) => {
  if (nextNode.type === NodeType.Instance && nextNode.id.indexOf(";") === -1) {
    const instanceDependency = getNodeDependency(nextNode, graph);
    return getComponentById(nextNode.componentId, instanceDependency, graph);
  }

  if (nextNode.id.charAt(0) !== "I") {
    return null;
  }

  const instance = getNodeInstance(nextNode, graph);
  const instanceDependency = getNodeDependency(instance, graph);
  const nodePath = getNodePath(nextNode, instance);

  const ancestorInstances = nodePath
    .map((v, i) => {
      const ancestor = getNodeByPath(nodePath.slice(0, i), instance);
      return [ancestor, nodePath.slice(i)];
    })
    .filter(([ancestor]) => {
      return ancestor.type === NodeType.Instance;
    });

  // cover variant children
  for (const [ancestor, nodePath] of ancestorInstances) {
    const component = getComponentById(
      ancestor.componentId,
      instanceDependency,
      graph
    );

    // Instances can remain, but components may be deleted - cover that case
    if (!component) {
      logWarn(`Found detached instance: ${instance.name}`);
      // console.log(instance, ancestor, JSON.stringify(instanceDependency, null, 2));
      return null;
    }

    const nodeByPath = getNodeByPath(nodePath, component);

    if (nodeByPath) {
      return nodeByPath;
    }
  }

  // should not happen
  throw new Error(`Could not find previous node`);
});

const getPrevNodes = memoize((nextNode: Node, graph: DependencyGraph) => {
  const prevNodeInstances = [];
  let currNode = nextNode;
  while (1) {
    currNode = getPrevNode(currNode, graph);
    if (!currNode) {
      break;
    }
    prevNodeInstances.push(currNode);
  }
  return prevNodeInstances;
});

const getNodeInstance = (node: Node, graph: DependencyGraph) => {
  const nodeDocument = getNodeDocument(node, graph);
  const instanceId = node.id.substr(1, node.id.indexOf(";") - 1);
  return getNodeById(instanceId, nodeDocument) as Instance;
};

const translateInstancePreview = (
  instance: Node,
  component: Component,
  context: TranslateContext,
  inComponent: boolean
) => {
  // skip detached instance
  if (!component) {
    return context;
  }

  const instanceDependency = getNodeDependency(instance, context.graph);

  if (!inComponent) {
    context = addVisibleFrame(context, instance);
  }
  context = addBuffer(
    `<${getPreviewComponentName(component, context)}`,
    context
  );

  const absoluteLayoutClass =
    context.compilerOptions.includeAbsoluteLayout && !inComponent
      ? `$absolute-position `
      : "";

  // class already exists on class, so skip className
  if (instance.type === NodeType.Component) {
    context = addBuffer(
      ` className="${absoluteLayoutClass}_${camelCase(
        instance.id
      )}_Preview_${getUniqueNodeName(
        instance,
        context.graph[context.entryFilePath].document
      )}"`,
      context
    );
  } else {
    context = addBuffer(
      ` className="${absoluteLayoutClass}${getNodeClassName(
        instance,
        context
      )}"`,
      context
    );
  }
  for (const textNode of getAllTextNodes(instance)) {
    const componentTextNode = getInstanceSourceNode(
      textNode,
      instance,
      component,
      context
    );

    const componentTextNodeName = getUniqueNodeName(
      componentTextNode,
      getNodeDocument(componentTextNode, context.graph)
    );

    if (inComponent) {
      // If in component, we want to pass text coming in from parent. Need to reference _instance_ of nested
      // text node this time since there may be other instances within component.
      context = addBuffer(
        ` ${componentTextNodeName}_text={${getUniqueNodeName(
          textNode,
          instanceDependency.document
        )}_text}`,
        context
      );
    } else {
      context = addBuffer(
        ` ${componentTextNodeName}_text={<fragment>${translateTextCharacters(
          textNode.characters
        )}</fragment>}`,
        context
      );
    }
  }
  context = addBuffer(` />\n`, context);
  return context;
};

const LAYOUT_STYLE_PROP_NAMES = ["left", "top", "width", "height", "position"];

const splitLayoutStyle = (style: any) => [
  pick(style, LAYOUT_STYLE_PROP_NAMES),
  omit(style, LAYOUT_STYLE_PROP_NAMES)
];

const translateStyles = (document: Document, context: TranslateContext) => {
  context = addBuffer(`<style>\n`, context);
  context = startBlock(context);

  context = translateComponentStyles(context);
  context = translateComponentSetStyles(context);

  const allComponents = getAllComponents(document);
  // context = translateNodeClassNames(allComponents, document, context, false);
  context = translatePreviewClassNames(allComponents, context);

  // Keep for reference. Don't want to translate all document children
  // because this will cause an explosion of nodes. Only want to compile components since
  // that's the only thing manageable
  // context = translateNodeClassNames(document.children, document, context, true);
  context = endBlock(context);
  context = addBuffer(`</style>\n\n`, context);
  return context;
};

const translateComponentStyles = (context: TranslateContext) => {
  const computedStyles = computeComponentStyles(context);

  for (const { node, style } of computedStyles) {
    const [layoutStyle, appearanceStyle] = splitLayoutStyle(style);

    const hasLayoutStyle = Object.keys(layoutStyle).length > 0;

    if (
      Object.keys(appearanceStyle).length === 0 &&
      !(context.compilerOptions.includeAbsoluteLayout && hasLayoutStyle)
    ) {
      continue;
    }

    const nodes = [node, ...getPrevNodes(node, context.graph)];

    let classNamePath = [];

    if (nodes.length > 1 || nodes[0].type !== NodeType.Component) {
      // if componenents exist in nodes list, then node is an instance, so skip them.
      classNamePath = nodes
        .filter(node => node.type !== NodeType.Component)
        .map(node => {
          const component = getOwnerComponent(
            node,
            getNodeDocument(node, context.graph)
          );
          return "." + getNodeClassName(component, context);
        });
    }

    const nodeClasName =
      "." + getNodeClassName(nodes[nodes.length - 1], context);

    const selector = `${classNamePath.join(
      ""
    )} ${nodeClasName}, ${classNamePath.join(" ")} ${nodeClasName}`.trim();

    context = addBuffer(`:global(${selector}) {\n`, context);
    context = startBlock(context);

    for (const key in appearanceStyle) {
      context = addBuffer(`${key}: ${appearanceStyle[key]};\n`, context);
    }

    context = endBlock(context);
    context = addBuffer("}\n\n", context);
  }

  return context;
};

const translateComponentSetStyles = (context: TranslateContext) => {
  const computedStyles = computeComponentSetStyles(context);

  return context;
};

const computeComponentSetStyles = (context: TranslateContext) => {
  const computed = [];

  const document = context.graph[context.entryFilePath].document;

  const componentSets = getAllComponentSets(document);

  for (const componentSet of componentSets) {
    computeComponentSetStyle(componentSet, context, computed);
  }
  return computed;
};

const computeComponentSetStyle = (
  componentSet: ComponentSet,
  context: TranslateContext,
  styles: any[]
) => {
  for (const component of componentSet.children) {
    computeNodeStyles(component, context, styles);
  }
};

const computeComponentStyles = (context: TranslateContext) => {
  const computed = [];

  const document = context.graph[context.entryFilePath].document;

  const components = getAllComponents(document).filter(
    component =>
      getNodeParent(component, document).type !== NodeType.ComponentSet
  );

  for (const component of components) {
    computeNodeStyles(component, context, computed);
  }
  return computed;
};

const getNodeStyle = (node: Node, context: TranslateContext) => {
  const computedStyle = getCSSStyle(node, context);
  let style = computedStyle;

  const name = getNodeComponentName(node, getNodeDocument(node, context.graph));

  if (name === "Property1Green0_Frame10") {
    const component = getOwnerComponent(
      node,
      getNodeDocument(node, context.graph)
    );
    const parent = getNodeParent(
      component,
      getNodeDocument(node, context.graph)
    );
  }

  // instance present?
  if (node.id.charAt(0) === "I" || node.type === NodeType.Instance) {
    const prevNodes = getPrevNodes(node, context.graph);

    for (const currNode of prevNodes) {
      const currNodeStyle = getCSSStyle(currNode, context);

      const updatedStyle = {};

      for (const key in currNodeStyle) {
        // no change from previous style, so skip since style is already applied
        if (style[key] === currNodeStyle[key]) {
          continue;
        }

        // Figma computes all styles on current instance, so if it doesn't exist, then
        // it's unset, so define that
        if (!computedStyle[key]) {
          updatedStyle[key] = "unset";
        }
      }

      for (const key in style) {
        // if current style is different than previous style, then keep it.
        if (style[key] !== currNodeStyle[key]) {
          updatedStyle[key] = style[key];
        }
      }

      style = updatedStyle;
    }
  }
  return style;
};

const computeNodeStyles = (
  node: Node,
  context: TranslateContext,
  styles: any[] = []
) => {
  const style = getNodeStyle(node, context);

  styles.push({ node, style });

  if (hasChildren(node)) {
    for (const child of node.children) {
      computeNodeStyles(child, context, styles);
    }
  }

  return styles;
};

const translatePreviewClassNames = (
  allComponents: Component[],
  context: TranslateContext
) => {
  if (!context.compilerOptions.includePreviews) {
    return context;
  }

  const PADDING = 10;
  let ctop = PADDING;

  return context;
  for (const component of allComponents) {
    const { x, y, width, height } = component.absoluteBoundingBox;
    context = addBuffer(
      `:global(._${camelCase(component.id)}_Preview_${getUniqueNodeName(
        component,
        context.graph[context.entryFilePath].document
      )}) {\n`,
      context
    );
    context = startBlock(context);
    context = addBuffer(`position: absolute;\n`, context);
    context = addBuffer(`left: ${PADDING}px;\n`, context);
    context = addBuffer(`top: ${ctop}px;\n`, context);
    context = addBuffer(`width: ${width}px;\n`, context);
    context = addBuffer(`height: ${height}px;\n`, context);
    context = endBlock(context);
    context = addBuffer("}\n\n", context);
    ctop += height + PADDING;
  }
  return context;
};

// TODO - need to use compoennt name
const getNodeClassName = (node: Node, context: TranslateContext) => {
  // We need to maintain node ID in class name since we're using the :global selector (which ensures that style overrides work properly).
  // ID here ensures that we're not accidentially overriding styles in other components or files.
  // ID is also prefixed here since that's the pattern used _internally_ for hash IDs.
  return (
    `_${camelCase(node.id)}_` +
    getUniqueNodeName(node, getNodeDocument(node, context.graph))
  );
};

// TODO - need to use compoennt name
const getNodeComponentName = (node: Node, document: Document) => {
  let nodeName = getUniqueNodeName(node, document);
  nodeName = nodeName.charAt(0).toUpperCase() + nodeName.substr(1);

  // dirty check for class prefix
  if (nodeName.indexOf("_") !== -1) {
    const [parentName, ...rest] = nodeName.split("_");
    nodeName = parentName + "_" + pascalCase(rest.join("_"));
  }

  return nodeName;
};

export type ComputedNestedStyleInfo = {
  node: Node;
  style: Record<string, string | number>;
  children: ComputedNestedStyleInfo[];
};

const getNestedCSSStyles = (
  node: Node,
  context: TranslateContext,
  instance?: Instance
): ComputedNestedStyleInfo => {
  const nodeStyle = getCSSStyle(node, context);
  return {
    node,
    style: nodeStyle,
    children: hasChildren(node)
      ? node.children.map(child => {
          return getNestedCSSStyles(
            child,
            context,
            node.type == NodeType.Instance ? node : instance
          );
        })
      : []
  };
};

const containsStyle = (
  info: ComputedNestedStyleInfo,
  document: Document,
  instanceOfId?: string
) => {
  if (Object.keys(info.style).length > 0) {
    return true;
  }
  for (const child of info.children) {
    if (containsStyle(child, document, instanceOfId)) {
      return true;
    }
  }
  return false;
};

const getCSSStyle = (node, context: TranslateContext) => {
  let style: Record<string, string | number> = {};

  if (isVectorLike(node)) {
    style.background = `url(./${getNodeExportFileName(
      node,
      getNodeDocument(node, context.graph),
      DEFAULT_EXPORT_SETTINGS
    )})`;

    Object.assign(style, getPositionStyle(node, context));
    return style;
  }

  if (hasVectorProps(node)) {
    Object.assign(style, getVectorStyle(node, context));
  }

  if (node.rectangleCornerRadii) {
    style["border-top-left-radius"] = node.rectangleCornerRadii[0] + "px";
    style["border-top-right-radius"] = node.rectangleCornerRadii[1] + "px";
    style["border-bottom-left-radius"] = node.rectangleCornerRadii[2] + "px";
    style["border-bottom-right-radius"] = node.rectangleCornerRadii[3] + "px";
  }

  if (node.type === NodeType.Text) {
    Object.assign(style, getPositionStyle(node, context));
    Object.assign(style, getTextStyle(node));

    const containsNonSolifFill = node.fills.some(
      fill => fill.type !== FillType.SOLID
    );

    if (containsNonSolifFill) {
      // can be noisy, so ignore for now
      // logNodeWarning(node, `cannot translate non-solid text color to CSS`);
    }

    // text color must be solid, so search for one
    const solidFill = node.fills.find(
      fill => fill.type === FillType.SOLID
    ) as SolidFill;
    if (solidFill) {
      style.color = getCSSRGBAColor(solidFill.color);
    }
  } else if (node.type === NodeType.Frame) {
    // Object.assign(style, getPositionStyle(node, context));
    // Object.assign(style, getFrameStyle(node, context));
  } else {
    // logNodeWarning(node, `Can't generate styles for ${node.type}`);
  }

  return style;
};

const getVectorStyle = (
  node: VectorNodeProps & BaseNode<any>,
  context: TranslateContext
) => {
  const style: any = {};
  if (node.absoluteBoundingBox && node.type !== NodeType.Component) {
    Object.assign(style, getPositionStyle(node, context));
  }
  if (node.fills.length) {
    const value = getFillStyleValue(node, node.fills);
    if (value) {
      style.background = value;
      const containsBlendModes = node.fills.some(fill => {
        return fill.blendMode !== "NORMAL";
      });

      if (containsBlendModes) {
        style["background-blend-mode"] = node.fills
          .map(fill => {
            return BLEND_MODE_MAP[fill.blendMode];
          })
          .join(", ");
      }
    }
  }
  if (node.blendMode && BLEND_MODE_MAP[node.blendMode]) {
    style["mix-blend-mode"] = BLEND_MODE_MAP[node.blendMode];
  }
  if (node.strokes.length) {
    const containsInvalidStroke =
      node.strokes.some(stroke => {
        return stroke.type !== FillType.SOLID;
      }) || node.strokes.length > 1;

    const solidStroke = node.strokes.find(
      stroke => stroke.type === FillType.SOLID
    ) as SolidFill;

    if (containsInvalidStroke) {
      logNodeWarning(node, `Only one solid fill stroke is supported`);
    }

    if (solidStroke) {
      style.border = `${node.strokeWeight}px solid ${getCSSRGBAColor(
        solidStroke.color
      )}`;
    }
  }

  if (node.effects.length) {
    Object.assign(style, getEffectsStyle(node, node.effects));
  }

  if (node.opacity != null) {
    style.opacity = node.opacity;
  }

  return style;
};

const getEffectsStyle = (node: Node, effects: Effect[]) => {
  const newStyle = {};
  const visibleEffects = effects.filter(effect => effect.visible !== false);
  const dropShadows = visibleEffects.filter(
    effect => effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW"
  );

  if (dropShadows.length) {
    newStyle["box-shadow"] = dropShadows
      .map(({ type, offset, radius, color }) => {
        return `${type === "INNER_SHADOW" ? "inset" : ""} ${offset.x}px ${
          offset.y
        }px ${radius}px ${getCSSRGBAColor(color)}`;
      })
      .join(", ");
  }

  const layerBlur = visibleEffects.find(effect => effect.type === "LAYER_BLUR");

  if (layerBlur) {
    newStyle["filter"] = `blur(${layerBlur.radius}px)`;
  }

  const backgroundBlur = visibleEffects.find(
    effect => effect.type === "BACKGROUND_BLUR"
  );

  if (layerBlur) {
    logNodeWarning(
      node,
      `Contains background blur which has minimal CSS support`
    );
    newStyle["backdrop-filter"] = `blur(${backgroundBlur.radius}px)`;
  }

  return newStyle;
};

const getFrameStyle = (
  node: FrameProps & BaseNode<any>,
  context: TranslateContext
) => {
  const style: any = {};
  Object.assign(style, getVectorStyle(node, context));
  if (node.clipsContent) {
    style.overflow = "hidden";
  }
  return style;
};

const getPositionStyle = (node: any, context: TranslateContext) => {
  if (context.compilerOptions.includeAbsoluteLayout === false) {
    return {};
  }
  const { relativeTransform, absoluteBoundingBox, size } = node;
  const document = getNodeDocument(node, context.graph);
  const nodePath = getNodePath(node, document);
  const frame = nodePath
    .map((v, i) => getNodeByPath(nodePath.slice(0, i), document))
    .find(node => {
      return (
        node.type !== NodeType.Document &&
        node.type !== NodeType.Canvas &&
        node.type !== NodeType.ComponentSet
      );
    });

  // relativeTransform may not be present, so we use absoluteBoundingBox as a
  // fallback.
  // const { left, top, width, height } = {
  //   left: relativeTransform[0][2],
  //   top: relativeTransform[1][2],
  //   width: size.x,
  //   height: size.y
  // };

  const { x: left, y: top, width, height } = {
    ...absoluteBoundingBox,
    x: absoluteBoundingBox.x - frame.absoluteBoundingBox.x,
    y: absoluteBoundingBox.y - frame.absoluteBoundingBox.y
  } as any;

  return {
    position: "fixed",
    left: Math.round(left) + "px",
    top: Math.round(top) + "px",
    width: Math.round(width) + "px",
    height: Math.round(height) + "px"
  };
};

const getFillStyleValue = (node: Node, fills: Fill[]) =>
  fills
    .reverse()
    .filter(fill => fill.visible !== false)
    .map((fill, index) => {
      switch (fill.type) {
        case FillType.SOLID: {
          return getCSSRGBAColor(fill.color, index === fills.length - 1);
        }
        case FillType.GRADIENT_LINEAR: {
          return getCSSLinearGradient(fill);
        }
        case FillType.GRADIENT_RADIAL: {
          return getCSSRadialGradient(fill);
        }
        case FillType.IMAGE: {
          return getCSSImageBackground(fill);
        }
        default: {
          // TODO - all gradient fills should work
          logNodeWarning(node, `Cannot translate ${fill.type} fill to CSS`);
          return null;
        }
      }
    })
    .filter(Boolean)
    .join(", ");

const getCSSRGBAColor = ({ r, g, b, a }: Color, last: boolean = true) => {
  const r2 = Math.round(r * 255);
  const g2 = Math.round(g * 255);
  const b2 = Math.round(b * 255);

  // TODO - generate hash
  let color;
  if (a !== 1) {
    color = `rgba(${r2}, ${g2}, ${b2}, ${a})`;
  } else {
    color = rgbToHex(r2, g2, b2);
  }

  return last ? color : `linear-gradient(0deg, ${color}, ${color})`;
};

const STYLE_MAP = {
  fontFamily: "font-family",
  fontWeight: "font-weight",
  fontSize: "font-size",
  letterSpacing: "letter-spacing"
};

const BLEND_MODE_MAP = {
  NORMAL: "normal",
  DARKEN: "darken",
  MULTIPLY: "multiply",
  COLOR_BURN: "color-burn",
  LIGHTEN: "lighten",
  SCREEN: "screen",
  COLOR_DODGE: "color-dodge",
  OVERLAY: "overlay",
  SOFT_LIGHT: "soft-light",
  HARD_LIGHT: "hard-light",
  DIFFERENCE: "difference",
  EXCLUSION: "exclusion",
  HUE: "hue",
  LUMINOSITY: "luminosity",
  SATURATION: "saturation",
  COLOR: "color"
};

const TEXT_DECORATION_MAP = {
  STRIKETHROUGH: "line-through",
  UNDERLINE: "underline"
};

const TEXT_TRANSFORM_MAP = {
  UPPER: "uppercase",
  LOWER: "lowercase",
  TITLE: "capitalize"
};

const getTextStyle = (node: Text) => {
  const style = node.style;
  const newStyle: any = {};

  if (node.blendMode && BLEND_MODE_MAP[node.blendMode]) {
    newStyle["mix-blend-mode"] = BLEND_MODE_MAP[node.blendMode];
  }

  if (style.fontFamily) {
    newStyle["font-family"] = style.fontFamily;
  }
  if (style.fontWeight) {
    newStyle["font-weight"] = style.fontWeight;
  }
  if (style.fontSize) {
    newStyle["font-size"] = style.fontSize + "px";
  }
  if (style.letterSpacing) {
    newStyle["letter-spacing"] =
      (Number(style.letterSpacing) / Number(style.fontSize)).toFixed(3) + "em";
  }

  if (style.lineHeightPercentFontSize) {
    newStyle["line-height"] =
      Math.round(Number(style.lineHeightPercentFontSize)) + "%";
  }

  if (style.textAlignHorizontal) {
    newStyle["text-align"] = String(style.textAlignHorizontal).toLowerCase();
  }

  if (style.textDecoration) {
    newStyle["text-decoration"] = TEXT_DECORATION_MAP[
      style.textDecoration
    ].toLowerCase();
  }

  if (style.paragraphIndent) {
    newStyle["text-indent"] =
      Number(Number(style.paragraphIndent).toFixed(2)) + "px";
  }

  if (style.textCase) {
    const transform = TEXT_TRANSFORM_MAP[style.textCase];
    if (transform) {
      newStyle["text-transform"] = transform;
    } else {
      // Noisy, so ignore.
      // logCannotConvertCssWarning(node, [
      //   "Text",
      //   "Letter Case",
      //   "Case",
      //   LETTER_CASE_LABEL_MAP[style.textCase] || style.textCase,
      // ]);
    }
  }

  if (style.opentypeFlags) {
    const fontFeatureSettings = Object.keys(style.opentypeFlags).map(
      key => `"${key.toLowerCase()}" on`
    );
    newStyle["font-featutes-settings"] = fontFeatureSettings.join(", ");
  }

  if (style.paragraphSpacing) {
    // Noisy, so ignore
    // logCannotConvertCssWarning(node, ["Text", "Paragraph Spacing"]);
  }

  return newStyle;
};

const getCSSLinearGradient = ({
  gradientHandlePositions,
  gradientStops
}: LinearGradient) => {
  // TODO: https://github.com/crcn/figmark/issues/12
  const radians = calcGradiantHandleRadians(gradientHandlePositions);
  return `linear-gradient(${radians}rad, ${gradientStops
    .map(stop => {
      return `${getCSSRGBAColor(stop.color)} ${stop.position * 100}%`;
    })
    .join(", ")})`;
};

const getCSSRadialGradient = ({ gradientStops }: RadialGradient) => {
  // TODO: https://github.com/crcn/figmark/issues/13
  return `radial-gradient(${gradientStops
    .map(stop => {
      return `${getCSSRGBAColor(stop.color)} ${stop.position * 100}%`;
    })
    .join(", ")})`;
};

const getCSSImageBackground = ({ imageRef }: ImageFill) => {
  // TODO: https://github.com/crcn/figmark/issues/13
  // TODO - need to get actual extension info.
  return `url("./${imageRef}.png")`;
};

const calcGradiantHandleRadians = ([first, second]: Vector[]) => {
  const ydiff = second.y - first.y;
  const xdiff = first.x - second.x;
  const radians = Math.atan2(-xdiff, -ydiff);
  return Number(radians.toFixed(3));
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
const logNodeWarning = (node: Node, message: string) => {
  logWarn(`Layer ${chalk.bold(node.name)}: ${message}`);
};

const highlightSectionInfo = (...path: string[]) =>
  chalk.bold(path.join(" ► "));
const logCannotConvertCssWarning = (node: Node, path: string[]) =>
  logNodeWarning(
    node,
    `Cannot convert ${highlightSectionInfo(...path)} to CSS`
  );
