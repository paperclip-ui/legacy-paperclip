import {
  AttributeKind,
  AttributeValueKind,
  Expression,
  isAttribute,
  isAttributeValue,
  isDynamicStringAttributeValuePart,
  isStyleSheet,
  isStyleObject,
  DynamicStringAttributeValuePartKind,
  DynamicStringAttributeValuePart,
  isStyleSelector,
  isNode,
  isJsExpression,
  isStyleDeclaration,
  Node,
  NodeKind,
  DynamicStringAttributeValue,
  JsExpressionKind,
  JsConjunctionOperatorKind,
  isRule,
  RuleKind,
  StyleDeclarationKind,
  SelectorKind
} from "paperclip";
import { Doc, FastPath, Printer, doc } from "prettier";
import { isBlockTagName } from "./utils";

const {
  concat,
  join,
  line,
  group,
  indent,
  dedent,
  softline,
  hardline,
  fill,
  breakParent,
  literalline
} = doc.builders;

const MAX_LINES = 1;

const groupConcat = (docs: Doc[]) => group(concat(docs));

const CONJ_OP_MAP = {
  [JsConjunctionOperatorKind.And]: "&&",
  [JsConjunctionOperatorKind.Or]: "||"
};

export const print = (path: FastPath, options: Object, print): Doc => {
  const expr: Expression = path.getValue();

  if (isStyleObject(expr)) {
    if (isStyleSheet(expr)) {
      return group(join(hardline, path.map(print, "rules")));
    } else if (isRule(expr)) {
      switch (expr.ruleKind) {
        case RuleKind.Style: {
          return printStyleRule(print)(path);
        }
      }
    } else if (isStyleDeclaration(expr)) {
      switch (expr.declarationKind) {
        case StyleDeclarationKind.KeyValue: {
          const buffer = [expr.name, ":", " ", expr.value, ";"];
          return groupConcat(buffer);
        }
      }
    } else if (isStyleSelector(expr)) {
      switch (expr.selectorKind) {
        case SelectorKind.Adjacent: {
          return join(" ", [
            path.call(print, "selector"),
            "+",
            path.call(print, "nextSiblingSelector")
          ]);
        }
        case SelectorKind.AllSelector: {
          return "*";
        }
        case SelectorKind.Attribute: {
          if (!expr.value) {
            return concat(["[", expr.name, "]"]);
          }

          return concat(["[", expr.name, expr.operator, expr.value, "]"]);
        }
        case SelectorKind.Child: {
          return join(" ", [
            path.call(print, "parent"),
            ">",
            path.call(print, "child")
          ]);
        }
        case SelectorKind.Class: {
          return concat([".", expr.className]);
        }
        case SelectorKind.Combo: {
          return concat(path.map(print, "selectors"));
        }
        case SelectorKind.Descendent: {
          return join(" ", [
            path.call(print, "ancestor"),
            path.call(print, "descendent")
          ]);
        }
        case SelectorKind.Element: {
          return expr.tagName;
        }
        case SelectorKind.Group: {
          return join(", ", path.map(print, "selectors"));
        }
        case SelectorKind.Id: {
          return concat(["#", expr.id]);
        }
        case SelectorKind.Not: {
          return concat([":not(", path.call(print, "selector"), ")"]);
        }
        case SelectorKind.PseudoElement: {
          return concat([expr.separator, expr.name]);
        }
        case SelectorKind.PseudoParamElement: {
          return concat([":", expr.name, "(", expr.param, ")"]);
        }
        case SelectorKind.Sibling: {
          return join(" ", [
            path.call(print, "selector"),
            "~",
            path.call(print, "siblingSelector")
          ]);
        }
        case SelectorKind.Within: {
          return concat([":within(", group(path.call(print, "selector")), ")"]);
        }
        case SelectorKind.Prefixed: {
          const buffer = ["&", expr.connector];
          if (expr.postfixSelector) {
            buffer.push(path.call(print, "postfixSelector"));
          }
          return concat(buffer);
        }
      }
    }
  } else if (isNode(expr)) {
    switch (expr.nodeKind) {
      case NodeKind.Fragment: {
        return join(hardline, path.map(print, "children"));
      }
      case NodeKind.Element: {
        let buffer: Doc[] = [];

        let openTag: Doc[] = ["<", expr.tagName];

        if (expr.attributes.length) {
          openTag.push(
            " ",
            indent(group(join(line, path.map(print, "attributes"))))
          );
        }

        const isEmpty = expr.children.length === 0;

        if (!isEmpty) {
          openTag.push(">");
          buffer.push(
            ...openTag,
            indent(
              concat([softline, group(join(line, path.map(print, "children")))])
            )
          );

          buffer.push(softline, `</${expr.tagName}>`);
        } else {
          buffer.push(...openTag, " />");
        }

        let doc: Doc = groupConcat(buffer);

        // TODO: break all elements option
        if (isBlockTagName(expr.tagName)) {
          doc = concat([doc, breakParent]);
        }

        return doc;
      }
      case NodeKind.StyleElement: {
        const buffer: Doc[] = ["<style>"];
        buffer.push(
          indent(group(concat([hardline, path.call(print, "sheet")])))
        );
        buffer.push(line, "</style>", breakParent);
        return groupConcat(buffer);
      }
      case NodeKind.Text: {
        return groupConcat([cleanWhitespace(expr.value)]);
      }
      case NodeKind.Slot: {
        return groupConcat(["{", path.call(print, "script"), "}"]);
      }
    }
  } else if (isAttribute(expr)) {
    switch (expr.attrKind) {
      case AttributeKind.KeyValueAttribute: {
        const buffer: Doc[] = [expr.name];
        if (expr.value) {
          buffer.push("=", path.call(print, "value"));
        }

        return groupConcat(buffer);
      }
      case AttributeKind.PropertyBoundAttribute: {
        const buffer: Doc[] = [expr.name, ":", expr.bindingName];
        buffer.push("=", path.call(print, "value"));
        return groupConcat(buffer);
      }
    }
  } else if (isAttributeValue(expr)) {
    switch (expr.attrValueKind) {
      case AttributeValueKind.Slot: {
        return groupConcat(["{", path.call(print, "script"), "}"]);
      }
      case AttributeValueKind.String: {
        return groupConcat(['"', expr.value, '"']);
      }
      case AttributeValueKind.DyanmicString: {
        const buffer = [];
        buffer.push('"');
        buffer.push(
          groupConcat(path.map(printDynamicStringAttribute(print), "values"))
        );
        buffer.push('"');
        return groupConcat(buffer);
      }
    }
  } else if (isJsExpression(expr)) {
    switch (expr.jsKind) {
      case JsExpressionKind.Reference: {
        const buffer = [];
        buffer.push(
          expr.path
            .map(part => {
              return part.name + (part.optional ? "?" : "");
            })
            .join(".")
        );
        return groupConcat(buffer);
      }
      case JsExpressionKind.String: {
        return groupConcat(['"', expr.value, '"']);
      }
      case JsExpressionKind.Boolean: {
        return String(expr.value);
      }
      case JsExpressionKind.Number: {
        return String(expr.value);
      }
      case JsExpressionKind.Group: {
        return groupConcat(["(", path.call(print, "expression"), ")"]);
      }
      case JsExpressionKind.Not: {
        return concat(["!", path.call(print, "expression")]);
      }
      case JsExpressionKind.Conjunction: {
        return groupConcat([
          path.call(print, "left"),
          " ",
          CONJ_OP_MAP[expr.operator],
          " ",
          path.call(print, "right")
        ]);
      }
    }
  }

  return "";
};

export const printDynamicStringAttribute = print => (
  path: FastPath,
  v: number
): Doc => {
  const expr = path.getValue();
  switch (expr.partKind) {
    case DynamicStringAttributeValuePartKind.Literal: {
      return groupConcat([expr.value]);
    }
    case DynamicStringAttributeValuePartKind.ClassNamePierce: {
      return groupConcat(["$", expr.className]);
    }
    case DynamicStringAttributeValuePartKind.Slot: {
      return concat(["{", print(path, v), "}"]);
    }
  }

  return "";
};

export const printStyleRule = print => (path: FastPath): Doc => {
  const expr = path.getValue();
  const buffer = [];
  buffer.push(group(path.call(print, "selector")), " ", "{");
  if (expr.declarations.length) {
    buffer.push(
      indent(
        concat([
          hardline,
          group(join(hardline, path.map(print, "declarations")))
        ])
      )
    );
  }
  if (expr.children.length) {
    buffer.push(
      indent(
        concat([
          hardline,
          group(join(hardline, path.map(printStyleRule(print), "children")))
        ])
      )
    );
  }

  buffer.push(softline, "}");

  return groupConcat(buffer);
};

const cleanNewLines = (buffer: string, before: boolean) => {
  const re = before ? /^[\s\r\n]+/ : /[\s\r\n]+$/;
  if (before) {
  }
  const match = buffer.match(re);

  return match
    ? Array.from({ length: Math.min(MAX_LINES, countNewLines(match[0])) }).map(
        v => hardline
      )
    : [];
};

const countNewLines = (ws: string) => {
  return (ws.match(/[\n\r]/g) || []).length;
};

const cleanWhitespace = (buffer: string) => {
  return buffer.trim().replace(/[\n\r\t\s]+/g, " ");
};
