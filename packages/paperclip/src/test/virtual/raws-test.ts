import { expect } from "chai";
import {
  isNode,
  isRule,
  isMaybeStyleSheet,
  isStyleDeclaration,
  isStyleObject,
  KeyframeRule,
  StyleRule,
  isStyleSelector,
  NodeKind,
  Sheet,
  RuleKind,
  SelectorKind,
  StyleDeclarationKind,
  ConditionRule
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
          background: blue;
          div {
            color: blue;
          }
        }
      </style>

      b
    `,
    `
      <style>
        color: red;

        @mixin abba {
          color: blue;
          @content;
        }

        @mixin b {
          @content;
        }

        @font-face {
          a: red;
        }

        @keyframes a {
          0% {
            color: blue;
          }
          10% {
            color: red;
          }
        }
        
        div {
          color: blue;

          background: orange;
          @media screen and (max-width: 100%) {
            color: red;

            div {
              color: red;
              @include abba {
                color: orange;
              }
            }
          }
        }
      </style>
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
          return stringifyStyleRule(ast);
        }
        case RuleKind.Mixin: {
          const buffer = [ast.raws.before, "@mixin ", ast.name.value, " {"];
          buffer.push(...ast.declarations.map(stringifyAST));
          buffer.push(...ast.rules.map(stringifyStyleRule));
          buffer.push("}", ast.raws.after);

          return buffer.join("");
        }
        case RuleKind.FontFace: {
          const buffer = [ast.raws.before, "@font-face {"];
          buffer.push(...ast.declarations.map(stringifyAST));
          buffer.push("}", ast.raws.after);

          return buffer.join("");
        }
        case RuleKind.Keyframes: {
          const buffer = [ast.raws.before, "@keyframes ", ast.name, " {"];
          buffer.push(...ast.rules.map(stringifyKeyframe));
          buffer.push("}", ast.raws.after);

          return buffer.join("");
        }
      }
    } else if (isStyleSelector(ast)) {
      // NOTE: only need to pick one since raws aren't kept in selectors
      switch (ast.selectorKind) {
        case SelectorKind.Element: {
          return ast.tagName;
        }
      }
    } else if (isStyleDeclaration(ast)) {
      switch (ast.declarationKind) {
        case StyleDeclarationKind.KeyValue: {
          return `${ast.raws.before}${ast.name}: ${ast.value};${ast.raws.after}`;
        }
        case StyleDeclarationKind.Content: {
          return `${ast.raws.before}@content;${ast.raws.after}`;
        }
        case StyleDeclarationKind.Include: {
          const buffer = [
            ast.raws.before,
            "@include ",
            ast.mixinName.parts.map(part => part.name).join("."),
            " {"
          ];

          buffer.push(...ast.declarations.map(stringifyAST));
          buffer.push(...ast.rules.map(stringifyStyleRule));

          buffer.push("}", ast.raws.after);
          return buffer.join("");
        }
        case StyleDeclarationKind.Media: {
          const buffer = [ast.raws.before, "@media", ast.conditionText, "{"];

          buffer.push(...ast.declarations.map(stringifyAST));
          buffer.push(...ast.rules.map(stringifyStyleRule));
          buffer.push("}", ast.raws.after);
          return buffer.join("");
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

const stringifyStyleRule = (ast: StyleRule) => {
  const buffer = [ast.raws.before, stringifyAST(ast.selector), " {"];
  buffer.push(...ast.declarations.map(stringifyAST));
  buffer.push(...ast.children.map(stringifyStyleRule));
  buffer.push("}", ast.raws.after);

  return buffer.join("");
};

const stringifyKeyframe = (ast: KeyframeRule) => {
  const buffer = [ast.raws.before, ast.key, "{"];
  buffer.push(...ast.declarations.map(stringifyAST));
  buffer.push("}", ast.raws.after);
  return buffer.join("");
};
