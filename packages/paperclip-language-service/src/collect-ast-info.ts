import {
  EvaluatedDataKind,
  LoadedCSSData,
  Sheet,
  LoadedData,
  LoadedPCData,
  memoize,
  SourceLocation,
  traverseExpression,
  DependencyContent,
  DependencyStyleSheetContent,
  DependencyNodeContent,
  Node,
  NodeKind,
  traverseStyleExpression,
  traverseSheet,
  isStyleDeclaration
} from "paperclip-utils";

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

type ASTInfo = {
  colors: ColorInfo[];
};

export const collectASTInfo = (
  entryUri: string,
  asts: Record<string, DependencyContent>,
  evaluatedData: Record<string, LoadedData>
) => {
  const map = {};

  for (const uri in evaluatedData) {
    map[uri] = collectDocumentASTInfo(evaluatedData[uri], asts[uri]);
  }

  return map[entryUri];
};

const collectDocumentASTInfo = memoize(
  (data: LoadedData, ast: DependencyContent) => {
    if (data.kind === EvaluatedDataKind.PC) {
      return collectPCDocumentASTInfo(data, ast as DependencyNodeContent);
    } else {
      return collectCSSDocumentASTInfo(
        data,
        ast as DependencyStyleSheetContent
      );
    }
  }
);

const collectPCDocumentASTInfo = (
  data: LoadedPCData,
  ast: DependencyNodeContent
) => {
  const info: ASTInfo = {
    colors: []
  };

  traverseExpression(ast, (node: Node) => {
    if (node.nodeKind === NodeKind.StyleElement) {
      collectStyleSheetInfo(node.sheet, info.colors);
    }
  });

  return info;
};

const collectCSSDocumentASTInfo = (
  data: LoadedCSSData,
  ast: DependencyStyleSheetContent
) => {
  const info: ASTInfo = {
    colors: []
  };

  return info;
};

const collectStyleSheetInfo = (ast: Sheet, colors: ColorInfo[]) => {
  traverseSheet(ast, expr => {
    if (isStyleDeclaration(expr)) {
      console.log("EXPR", expr);
    }
  });
};
