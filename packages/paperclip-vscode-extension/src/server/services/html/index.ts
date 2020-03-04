import { BaseEngineLanguageService, ASTInfo } from "../base";
import {
  Rule,
  Node,
  Sheet,
  Element,
  NodeKind,
  getParts,
  RuleKind,
  getImports,
  Block,
  EachBlock,
  Conditional,
  ConditionalBlock,
  BlockKind,
  ConditionalBlockKind,
  EngineEvent,
  getImportIds,
  EvaluatedEvent,
  EngineEventKind,
  NodeParsedEvent,
  getStyleElements,
  getAttributeValue,
  getChildren,
  AttributeValueKind,
  getVisibleChildNodes,
  getAttributeStringValue,
  AttributeKind,
  StatementKind,
  resolveImportUri
} from "paperclip";
import * as path from "path";

import CSS_COLOR_NAMES from "./css-color-names";
const CSS_COLOR_NAME_LIST = Object.keys(CSS_COLOR_NAMES);
const CSS_COLOR_NAME_REGEXP = new RegExp(
  `\\b(${CSS_COLOR_NAME_LIST.join("|")})\\b`,
  "g"
);

/**
 * Main HTML language service. Contains everything for now.
 */

type HandleContext = {
  root: Node;
  uri: string;
  importIds: string[];
  partIds: string[];
  info: ASTInfo;
};

export class PCHTMLLanguageService extends BaseEngineLanguageService<Node> {
  supports(uri: string) {
    return /\.pc$/.test(uri);
  }
  protected _handleEngineEvent(event: EngineEvent) {
    if (event.kind === EngineEventKind.NodeParsed) {
      this._handleNodeParsedEvent(event);
    } else if (event.kind === EngineEventKind.Evaluated) {
      this._handleEvaluatedEvent(event);
    }
  }

  private _handleNodeParsedEvent({ node, uri }: NodeParsedEvent) {
    this._addAST(node, uri);
  }
  protected _createASTInfo(root: Node, uri: string) {
    const context: HandleContext = {
      root,
      uri,
      importIds: getImportIds(root),
      partIds: getParts(root)
        .map(part => getAttributeStringValue("id", part))
        .filter(Boolean),
      info: {
        colors: [],
        links: [],
        definitions: []
      }
    };
    this._handleStyles(context);
    this._handleDocument(context);

    return context.info;
  }

  private _handleEvaluatedEvent(event: EvaluatedEvent) {}

  private _handleStyles(context: HandleContext) {
    const styleElements = getStyleElements(context.root);
    for (const { sheet } of styleElements) {
      this._handleSheet(sheet, context);
    }
  }

  private _handleSheet(sheet: Sheet, context: HandleContext) {
    this._handleRules(sheet.rules, context);
  }

  private _handleRules(rules: Rule[], context: HandleContext) {
    for (const rule of rules) {
      if (rule.kind === RuleKind.Style) {
        this._handleRule(rule, context);
      }
    }
  }

  private _handleRule(rule: Rule, context: HandleContext) {
    for (const declaration of rule.declarations) {
      const colors =
        declaration.value.match(/\#[^\s,;]+|(rgba|rgb|hsl|hsla)\(.*?\)/g) ||
        declaration.value.match(CSS_COLOR_NAME_REGEXP) ||
        [];

      for (const color of colors) {
        const colorIndex = declaration.value.indexOf(color);

        // Color(color)
        // const {color: [r, g, b], valpha: a } = Color(color);
        const colorStart = declaration.valueLocation.start + colorIndex;

        context.info.colors.push({
          color,
          location: { start: colorStart, end: colorStart + color.length }
        });
      }
    }
  }

  private _handleDocument(context: HandleContext) {
    this._handleImports(context);
    this._handleMainTemplate(context);
    this._handleParts(context);
  }

  private _handleImports(context: HandleContext) {
    const { root: node, uri } = context;
    const imports = getImports(node);
    for (const imp of imports) {
      const srcAttr = getAttributeValue("src", imp);
      if (srcAttr.attrValueKind === AttributeValueKind.String) {
        context.info.links.push({
          uri: resolveImportUri(uri, srcAttr.value),
          location: srcAttr.location
        });
      }
    }
  }

  private _handleMainTemplate(context: HandleContext) {
    for (const child of getChildren(context.root)) {
      this._handleNode(child, context);
    }
  }

  private _handleParts(context: HandleContext) {
    for (const child of getParts(context.root)) {
      this._handleNode(child, context);
    }
  }

  private _handleNode(node: Node, context: HandleContext) {
    if (node.kind === NodeKind.Element) {
      this._handleElement(node, context);
    }
    if (node.kind === NodeKind.Block) {
      this._handleBlock(node, context);
    }
    for (const child of getChildren(node)) {
      this._handleNode(child, context);
    }
  }

  private _handleBlock(block: Block, context: HandleContext) {
    if (block.blockKind === BlockKind.Each) {
      if (block.body) {
        this._handleNode(block.body, context);
      }
    } else if (block.blockKind === BlockKind.Conditional) {
      this._handleConditional(block, context);
    }
  }

  private _handleConditional(block: Conditional, context: HandleContext) {
    if (block.body) {
      this._handleNode(block.body, context);
    }
    if (block.conditionalBlockKind === ConditionalBlockKind.PassFailBlock) {
      if (block.fail) {
        this._handleConditional(block.fail, context);
      }
    }
  }

  private _handleElement(element: Element, context: HandleContext) {
    const tagParts = element.tagName.split(":");
    const namespace = tagParts[0];
    const name = tagParts[tagParts.length - 1];
    this._handleAttributes(element, context);
    if (context.partIds.indexOf(namespace) !== -1) {
      this._handlePartInstance(
        element,
        namespace,
        context.root,
        context.uri,
        context
      );
    } else if (context.importIds.indexOf(namespace) !== -1) {
      const imp = getImports(context.root).find(imp => {
        return getAttributeStringValue("id", imp) === namespace;
      });

      const impUri = resolveUri(
        context.uri,
        getAttributeStringValue("src", imp)
      );

      const impAst = this._getAST(impUri);

      if (impAst) {
        if (tagParts.length === 2) {
          this._handlePartInstance(element, name, impAst, impUri, context);
        } else {
          const firstVisibleNode = getChildren(impAst)[0];

          context.info.definitions.push({
            sourceUri: impUri,
            sourceLocation: (firstVisibleNode &&
              firstVisibleNode.kind === NodeKind.Element &&
              firstVisibleNode.openTagLocation) || { start: 0, end: 0 },
            sourceDefinitionLocation: (firstVisibleNode &&
              firstVisibleNode.kind === NodeKind.Element &&
              firstVisibleNode.location) || { start: 0, end: 0 },
            instanceLocation: element.tagNameLocation
          });
        }
      }
    }
  }

  private _handleAttributes(element: Element, context: HandleContext) {
    for (const attr of element.attributes) {
      if (attr.kind === AttributeKind.KeyValueAttribute && attr.value) {
        if (attr.value.attrValueKind === AttributeValueKind.Slot) {
          if (attr.value.jsKind === StatementKind.Node) {
            this._handleNode((attr.value as any) as Node, context);
          }
        } else if (
          (attr.value.attrValueKind === AttributeValueKind.String,
          attr.name === "src")
        ) {
          context.info.links.push({
            uri: resolveUri(context.uri, attr.value.value),
            location: attr.value.location
          });
        }
      }
    }
  }

  private _handlePartInstance(
    element: Element,
    name: string,
    sourceRoot: Node,
    sourceUri: string,
    context: HandleContext
  ) {
    const part = getParts(sourceRoot).find(part => {
      return getAttributeStringValue("id", part) === name;
    });

    if (part) {
      context.info.definitions.push({
        sourceUri,
        sourceLocation: part.openTagLocation,
        sourceDefinitionLocation: part.location,
        instanceLocation: element.tagNameLocation
      });
    }
  }
}

const resolveUri = (fromUri: string, relativePath: string) => {
  return (
    "file://" +
    path.normalize(
      path.join(path.dirname(fromUri.replace("file://", "")), relativePath)
    )
  );
};
