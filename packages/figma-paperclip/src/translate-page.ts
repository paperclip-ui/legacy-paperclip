// import { OutputFile } from "./base";
// import * as path from "path";
// import {
//   kebabCase,
//   uniq,
//   snakeCase,
//   isEqual,
//   flatten,
//   pick,
//   camelCase,
//   omit
// } from "lodash";
// import * as chalk from "chalk";
// import { logWarn, pascalCase } from "./utils";
// import {
//   Dependency2,
//   flattenNodes,
//   getMixinStyles,
//   DependencyGraph,
//   getNodeById,
//   Point,
//   getNodeParent,
//   getComponentName,
//   getInstanceComponent,
//   getAllComponents,
//   getOwnerComponent,
//   getLayerMixins,
//   extractMixedInSyles
// } from "./state";

// import {
//   TranslateContext,
//   TranslateOptions,
//   createContext,
//   addBuffer,
//   startBlock,
//   endBlock,
//   writeStyleDeclaration,
//   round,
//   px,
//   writeStyleDeclarations,
//   getLayerStyle,
//   writeElementBlock,
//   writeFrameComment,
//   writeStyleBlock
// } from "./translate-utils";

// export const translatePage = (
//   page: any,
//   fileKey: string,
//   graph: DependencyGraph,
//   options: TranslateOptions
// ): OutputFile[] => {
//   const pagePath = path.join(options.cwd, kebabCase(page.name) + ".pc");
//   let context = createContext(fileKey, graph, options);

//   const files: OutputFile[] = [];

//   context = translateIncludes(options.includes, context);
//   // context = translateStyles(page, context);
//   // context = translateComponentSets(page, context);
//   // context = translateComponents(page, context);
//   context = translateImports(context);
//   context = translateCanvas(page, context);

//   // TODO - include dependencies
//   return [
//     {
//       path: path.join(options.cwd, kebabCase(page.name) + ".pc"),
//       content: context.content
//     }
//   ];
// };

// const translateIncludes = (includes: string[], context: TranslateContext) => {
//   for (const inc of includes) {
//     let relPath = path.relative(context.options.cwd, inc);
//     if (relPath.charAt(0) !== ".") {
//       relPath = "./" + relPath;
//     }
//     context = addBuffer(`<import src="${relPath}" inject-styles />\n`, context);
//   }

//   if (includes.length) {
//     context = addBuffer("\n", context);
//   }

//   return context;
// };

// const translateStyles = (page: any, context: TranslateContext) => {
//   context = writeElementBlock(
//     { tagName: "style" },
//     context => {
//       context = translateMixins(page, context);
//       return context;
//     },
//     context
//   );
//   return context;
// };

// const translateMixins = (page: any, context: TranslateContext) => {
//   const components = getAllComponents(page);

//   context = writeStyleBlock(
//     "@export",
//     context => {
//       for (const component of components) {
//         const layers = flattenNodes(component);

//         for (const layer of layers) {
//           // skip instances since they're already exported
//           if (layer.type === "INSTANCE" || layer.id.charAt(0) === "I") {
//             continue;
//           }

//           const parent = getNodeParent(layer, page);
//           const name =
//             camelCase(
//               parent?.type === "COMPONENT_SET" ? parent.name : layer.name
//             ) +
//             "_" +
//             snakeCase(layer.id);
//           const style = getLayerStyle(layer);

//           if (!Object.keys(style).length) {
//             continue;
//           }
//           context = writeStyleBlock(
//             `@mixin ${name}`,
//             context => {
//               context = writeStyleDeclarations(style, context);
//               return context;
//             },
//             context
//           );
//         }
//       }

//       return context;
//     },
//     context
//   );

//   return context;
// };

// const translateComponentSets = (page: any, context: TranslateContext) => {
//   const dep = context.graph[context.fileKey];
//   const componentSets = flattenNodes(page).filter(
//     layer => layer.type === "COMPONENT_SET"
//   );
//   for (const componentSet of componentSets) {
//     context = translateComponentSet(componentSet, context);
//   }
//   return context;
// };

// const translateComponentSet = (
//   componentSet: any,
//   context: TranslateContext
// ) => {
//   context = writeFrameComment(componentSet, context, false);
//   const attributes = `export component as="${getComponentName(componentSet)}"`;

//   return writeElementBlock(
//     { tagName: "div", attributes },
//     context => {
//       return context;
//     },
//     context
//   );
// };

// const translateComponents = (page: any, context: TranslateContext) => {
//   const dep = context.graph[context.fileKey];
//   const components = flattenNodes(page).filter(
//     layer =>
//       layer.type === "COMPONENT" &&
//       getNodeParent(layer, dep.document).type !== "COMPONENT_SET"
//   );

//   for (const component of components) {
//     context = translateComponent(component, context);
//   }
//   return context;
// };

// const translateComponent = (component: any, context: TranslateContext) => {
//   context = writeFrameComment(component, context, false);
//   const attributes = `export component as="${getComponentName(component)}"`;

//   return writeElementBlock(
//     { tagName: "div", attributes },
//     context => {
//       context = translateBasicLayer(component, { x: 0, y: 0 }, context);
//       return context;
//     },
//     context
//   );
//   return context;
// };

// const translateImports = (context: TranslateContext) => {
//   const module = context.graph[context.fileKey];
//   const imported = {};
//   context = addBuffer(
//     `<import src="../atoms.pc" as="atoms" inject-styles />\n`,
//     context
//   );

//   for (const importId in module.imports) {
//     const imp = module.imports[importId];
//     if (imported[imp.fileKey]) {
//       continue;
//     }
//     imported[imp.fileKey] = true;
//     const dep = context.graph[imp.fileKey];
//     context = addBuffer(
//       `<import src="../../${kebabCase(dep.name)}/atoms.pc" as="${camelCase(
//         dep.name
//       )}Atoms" inject-styles />\n`,
//       context
//     );
//   }
//   return context;
// };

// const translateCanvas = (canvas: any, context: TranslateContext) => {
//   for (const artboard of canvas.children) {
//     context = translateArtboard(artboard, context);
//   }

//   return context;
// };

// const translateArtboard = (artboard: any, context: TranslateContext) => {
//   context = writeFrameComment(artboard, context);
//   context = translateLayer(artboard, { x: 0, y: 0 }, context);
//   context = addBuffer(`\n`, context);
//   return context;
// };
// const translateLayer = (
//   layer: any,
//   point: Point,
//   context: TranslateContext
// ) => {
//   switch (layer.type) {
//     case "TEXT":
//       return translateTextLayer(layer, context);
//     case "VECTOR":
//       return translateVectorLayer(layer, context);
//     // case "INSTANCE":
//     //   return translateInstance(layer, context);
//     // case "COMPONENT": {
//     //   return translateComponentAsInstance(layer, context);
//     // }
//     //  {
//     //   return translateComponentSetAsInstance(layer, context);
//     // }
//     // case "COMPONENT_SET":
//     default: {
//       return translateBasicLayer(layer, point, context);
//     }
//   }
// };

// const translateComponentAsInstance = (
//   layer: any,
//   context: TranslateContext
// ) => {
//   context = addBuffer(`<${getComponentName(layer)} />\n`, context);
//   return context;
// };

// const translateComponentSetAsInstance = (
//   layer: any,
//   context: TranslateContext
// ) => {
//   context = addBuffer(`<${getComponentName(layer)} />\n`, context);
//   return context;
// };

// const translateTextLayer = (layer: any, context: TranslateContext) => {
//   context = addBuffer(`<span>\n`, context);
//   context = startBlock(context);
//   context = translateLayerStyleElement(layer, null, context);
//   context = addBuffer(`${layer.characters}\n`, context);
//   context = endBlock(context);
//   context = addBuffer(`</span>\n`, context);
//   return context;
// };

// const translateVectorLayer = (layer: any, context: TranslateContext) => {
//   return context;
// };

// const translateInstance = (layer: any, context: TranslateContext) => {
//   const component = getInstanceComponent(layer, context.fileKey, context.graph);
//   if (component) {
//     context = addBuffer(`<${getComponentName(component)} />\n`, context);
//   } else {
//     console.log("COMPONENT NOT FOUND");
//   }

//   return context;
// };

// const translateRectangleLayer = (
//   layer: any,
//   point: Point,
//   context: TranslateContext
// ) => {
//   context = addBuffer(
//     `<div aria-label=${JSON.stringify(layer.name)}>\n`,
//     context
//   );
//   context = startBlock(context);
//   context = translateLayerStyleElement(layer, point, context);
//   context = endBlock(context);
//   context = addBuffer(`</div>\n`, context);
//   return context;
// };

// const translateBasicLayer = (
//   layer: any,
//   point: Point,
//   context: TranslateContext
// ) => {
//   context = addBuffer(
//     `<div aria-label=${JSON.stringify(layer.name)}>\n`,
//     context
//   );
//   context = startBlock(context);
//   context = translateLayerStyleElement(layer, point, context);
//   if (layer.children) {
//     context = translateLayerChildren(layer, point, context);
//   }
//   context = endBlock(context);
//   context = addBuffer(`</div>\n`, context);
//   return context;
// };

// const translateLayerChildren = (
//   layer: any,
//   point: Point,
//   context: TranslateContext
// ) => {
//   context = { ...context, isFrame: false };
//   for (const child of layer.children) {
//     context = translateLayer(child, calcLayerPoint(child, point), context);
//   }
//   return context;
// };

// const calcLayerPoint = ({ absoluteBoundingBox }: any, parentPoint: Point) => {
//   return {
//     x: absoluteBoundingBox.x - parentPoint.x,
//     y: absoluteBoundingBox.x - parentPoint.y
//   };
// };

// const translateLayerStyleElement = (
//   layer: any,
//   point: Point,
//   context: TranslateContext
// ) => {
//   context = addBuffer(`<style>\n`, context);
//   context = startBlock(context);
//   const style = getInlineStyle(layer, context);
//   context = writeStyleDeclarations(style, context);
//   context = endBlock(context);
//   context = addBuffer(`</style>\n`, context);
//   return context;
// };

// const getInlineStyle = (layer: any, context: TranslateContext) => {
//   const { absoluteBoundingBox } = layer;
//   const style: any = {};
//   const dep = context.graph[context.fileKey];
//   if (context.isFrame) {
//     Object.assign(style, {
//       width: `100vw`,
//       height: `100vh`
//     });
//   } else {
//     Object.assign(style, {
//       position: "fixed",
//       width: px(absoluteBoundingBox.width),
//       height: px(absoluteBoundingBox.height),
//       left: px(absoluteBoundingBox.x - context.framePosition.x),
//       top: px(absoluteBoundingBox.y - context.framePosition.y)
//     });
//   }
//   const mixedInStyles = extractMixedInSyles(layer);
//   let layerStyle = getLayerStyle(layer);

//   for (const mixinId in mixedInStyles) {
//     const mixedInStyle = mixedInStyles[mixinId];
//     const mixin = dep.styles[mixinId];

//     let ns;
//     let mixinDep = dep;
//     if (!dep.imports[mixinId]) {
//       ns = "atoms";
//     } else {
//       mixinDep = context.graph[dep.imports[mixinId].fileKey];
//       ns = camelCase(mixinDep.name) + "Atoms";
//     }

//     if (mixin.styleType === "FILL") {
//       for (const key in mixedInStyle) {
//         layerStyle[key] = `var(--${kebabCase(mixin.name)})`;
//       }
//     } else if (mixin.styleType === "TEXT" || mixin.styleType === "EFFECT") {
//       // possibly dealing with detached mixin
//       const mixinExists = Object.values(mixinDep.styles).some(style => {
//         return (style as any).name === mixin.name;
//       });

//       if (!mixinExists) {
//         logWarn(
//           `Mixin ${chalk.bold(mixin.name)} does't exist for ${chalk.bold(
//             dep.name
//           )}`
//         );
//         continue;
//       }

//       // TODO - need to figure out whether the style exists
//       layerStyle = omit(style, Object.keys(mixedInStyle));
//       if (!layerStyle["@include"]) {
//         layerStyle["@include"] = [];
//       }
//       layerStyle["@include"].push(`${ns}.${kebabCase(mixin.name)}`);
//     }
//   }

//   Object.assign(style, layerStyle);

//   return style;
// };
