import { expect } from "chai";
import {
  isNode,
  isRule,
  isMaybeStyleSheet,
  isStyleDeclaration,
  isStyleObject,
  isStyleSelector,
  NodeKind,
  Sheet,
  RuleKind,
  SelectorKind,
  StyleDeclarationKind
} from "paperclip-utils";
import { createMockEngine } from "../utils";

describe(__filename + "#", () => {
  [
    `
      <div></div>
    `,
    `
      <div>
        a
      </div>
    `,
    `
      <div>
        a
      </div>

      b
    `,
    `
      <div></div>

      <style>
      </style>

      b
    `,
    `
      <div></div>


      <style>
        a {
          color: red;
        }
      </style>

      b
    `
  ].forEach(source => {
    it(`Maintains the whitepsace for ${source.replace(
      /[\s\r\n\t]+/g,
      " "
    )}`, async () => {
      const graph = {
        "/entry.pc": source
      };
      const engine = await createMockEngine(graph);
      await engine.open("/entry.pc");

      const ast = (await engine.getLoadedAst("/entry.pc")) as any;

      const output = stringifyAST(ast);

      expect(output).to.eql(source);
    });
  });
});

const stringifyAST = ast => {
  if (isNode(ast)) {
    switch (ast.nodeKind) {
      case NodeKind.Fragment: {
        return ast.children.map(stringifyAST).join("");
      }
      case NodeKind.Element: {
        const buffer = [ast.raws.before];
        buffer.push(`<${ast.tagName}`);
        if (ast.attributes.length) {
          const attrs = ast.attributes.map(stringifyAST);
          buffer.push(` `, attrs.join(" "));
        }
        buffer.push(">");

        buffer.push(ast.children.map(stringifyAST).join(""));
        buffer.push(`</${ast.tagName}>`);

        return buffer.join("");
      }
      case NodeKind.Text: {
        return ast.value;
      }
      case NodeKind.StyleElement: {
        const buffer = [ast.raws?.before];

        buffer.push("<style>");
        buffer.push(stringifyAST(ast.sheet));
        buffer.push("</style>");

        buffer.push(ast.raws?.after || "");
        return buffer.join("");
      }
    }
  } else if (isStyleObject(ast)) {
    if (isRule(ast)) {
      switch (ast.ruleKind) {
        case RuleKind.Style: {
          const buffer = [ast.raws.before, stringifyAST(ast.selector), " {"];
          buffer.push(...ast.declarations.map(stringifyAST));
          buffer.push(...ast.children.map(stringifyAST));
          buffer.push("}", ast.raws.after);

          return buffer.join("");
        }
      }
    } else if (isStyleSelector(ast)) {
      switch (ast.selectorKind) {
        case SelectorKind.Element: {
          return ast.tagName;
        }
      }
    } else if (isStyleDeclaration(ast)) {
      console.log(ast);
      switch (ast.declarationKind) {
        case StyleDeclarationKind.KeyValue: {
          return `${ast.name}: ${ast.value};`;
        }
      }
    } else if (isMaybeStyleSheet(ast)) {
      const buffer = [ast.raws.before];
      buffer.push(...ast.declarations.map(stringifyAST));
      buffer.push(...ast.rules.map(stringifyAST));

      buffer.push(ast.raws.after);
      return buffer.join("");
    }
  }
};
