import { EngineDelegate } from "paperclip";
import {
  Attribute,
  AttributeKind,
  computeVirtJSObject,
  DependencyContentKind,
  EvaluatedDataKind,
  Expression,
  getAttribute,
  isAttribute,
  isNode,
  isStyleObject,
  ScriptExpression,
  Node,
  NodeKind,
  NodeStyleInspection,
  Reference,
  StyleExpression,
  StyleRuleInfo,
  traverseExpression,
  VirtualElement,
  VirtualNode,
  VirtualNodeKind,
  VirtualText
} from "paperclip-utils";
import { FileReport } from "./state";
import { traverseVirtNode } from "./utils";

const FRAME_WIDTH = 1024;

type MissedStatements = Record<string, Record<string, boolean>>;

export const generateCodeCoverageReport = async (
  filePaths: string[],
  engine: EngineDelegate
) => {
  engine.includeUsedExprIds();

  const fileReports = await generateFileReports(filePaths, engine);

  // TODO - calc summary from files coverage
  return {
    files: fileReports
  };
};

const generateFileReports = async (
  filePaths: string[],
  engine: EngineDelegate
) => {
  const fileReports: Record<string, FileReport> = {};
  const missedStatements = await generateMissedStatements(filePaths, engine);

  // analyze all files
  for (const filePath of filePaths) {
    await analyzeFile(filePath, missedStatements, engine);
  }

  return filePaths.map(filePath =>
    generateFileReport(filePath, missedStatements, engine)
  );
};

const generateFileReport = (
  filePath: string,
  missedStatements: MissedStatements,
  engine: EngineDelegate
): FileReport => {
  const content = engine.getVirtualContent(filePath);
  console.log(missedStatements);
  return {
    filePath,
    missedLines: [],
    // missedLines: Object.keys(missedLines[filePath]).map(Number),
    lineCount: content.split("\n").length
  };
};

const generateMissedLines = (missedStatements: MissedStatements) => {
  console.log(missedStatements);
};

const generateMissedStatements = async (
  filePaths: string[],
  engine: EngineDelegate
) => {
  const missedStatements: MissedStatements = {};

  for (const filePath of filePaths) {
    missedStatements[filePath] = await generateMissedFileStatements(
      filePath,
      engine
    );
  }

  return missedStatements;
};

const eachAnalyzableExpr = (
  each: (expr: StyleExpression | Node | Attribute) => void
) => (expr: Expression) => {
  if (isNode(expr)) {
    if (expr.nodeKind === NodeKind.Element) {
      if (expr.tagName === "import") {
        return false;
      }
    }
  }

  if (isNode(expr) || isStyleObject(expr) || isAttribute(expr)) {
    each(expr);
  }
};

const generateMissedFileStatements = async (
  filePath: string,
  engine: EngineDelegate
) => {
  const missedStatements: Record<number, boolean> = {};
  const result = await engine.open(filePath);
  const ast = engine.getLoadedAst(filePath);

  const eachExpression = eachAnalyzableExpr(expr => {
    if (result.kind === EvaluatedDataKind.PC) {
      if (result.usedExprIds.includes(expr.id)) {
        return;
      }
    }

    missedStatements[expr.id] = true;
  });

  if (ast.contentKind === DependencyContentKind.Node) {
    if (ast.nodeKind === NodeKind.Fragment) {
      // need to skip whitespace
      ast.children.forEach(child => traverseExpression(child, eachExpression));
    } else {
      traverseExpression(ast, eachExpression);
    }
  } else if (ast.contentKind === DependencyContentKind.Stylsheet) {
    // FIXME: should be able to pass Stylesheet AST to traverseExpression
    ast.rules.forEach(rule => traverseExpression(rule, eachExpression));
  }

  return missedStatements;
};

const analyzeFile = (
  filePath: string,
  missedStatements: MissedStatements,
  engine: EngineDelegate
) => {
  const virt = engine.open(filePath);
  if (virt.kind === EvaluatedDataKind.PC) {
    const frames =
      virt.preview.kind === VirtualNodeKind.Fragment
        ? virt.preview.children
        : [virt.preview];
    for (let i = 0, { length } = frames; i < length; i++) {
      const frame = frames[i];
      if (
        frame.kind === VirtualNodeKind.Element ||
        frame.kind === VirtualNodeKind.Text
      ) {
        analyzeFrame(frame, i, filePath, missedStatements, engine);
      }
    }
  }
};

const analyzeFrame = (
  frame: VirtualElement | VirtualText,
  frameIndex: number,
  filePath: string,
  missedStatements: MissedStatements,
  engine: EngineDelegate
) => {
  const annotations: Record<string, any> = frame.annotations
    ? computeVirtJSObject(frame.annotations)
    : {};

  let frameWidth = FRAME_WIDTH;

  if (annotations.frame) {
    if (annotations.frame.visible === false) {
      return;
    }
    if (annotations.frame.width) {
      frameWidth = annotations.frame.width;
    }
  }

  traverseVirtNode(
    frame,
    (descendent: VirtualNode, path: number[]) => {
      analyzeNode(
        descendent,
        path,
        frameWidth,
        filePath,
        missedStatements,
        engine
      );
    },
    [frameIndex]
  );
};

const analyzeNode = (
  node: VirtualNode,
  path: number[],
  frameWidth: number,
  filePath: string,
  missedStatements: MissedStatements,
  engine: EngineDelegate
) => {
  const result = engine.getVirtualNodeSourceInfo(path, filePath);

  if (!result) {
    return;
  }

  delete missedStatements[result.sourceId];

  if (node.kind === VirtualNodeKind.Element) {
    const styleInspection = engine.inspectNodeStyles(
      { uri: filePath, path },
      frameWidth
    );
    for (const styleRule of styleInspection.styleRules) {
      console.log(styleRule);
    }
  }
};
