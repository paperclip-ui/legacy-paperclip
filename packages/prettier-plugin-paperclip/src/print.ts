import {
  AttributeKind,
  AttributeValueKind,
  Expression,
  isAttribute,
  isAttributeValue,
  isNode,
  isStyleDeclaration,
  Node,
  NodeKind
} from "paperclip";
import { Doc, FastPath, Printer, doc } from "prettier";

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

export const print = (path: FastPath, options: Object, print): Doc => {
  const expr: Expression = path.getValue();

  if (isNode(expr)) {
    switch (expr.kind) {
      case NodeKind.Fragment: {
        return join(hardline, path.map(print, "children"));
      }
      case NodeKind.Element: {
        const buffer: Doc[] = ["<", expr.tagName];
        buffer.push(concat(path.map(print, "attributes")));

        const isEmpty = expr.children.length === 0;

        if (!isEmpty) {
          buffer.push(">");
          buffer.push(
            group(
              indent(
                concat([softline, join(hardline, path.map(print, "children"))])
              )
            )
          );

          buffer.push(softline, `</${expr.tagName}>`);
        } else {
          buffer.push(" />");
        }

        return groupConcat(buffer);
      }
      case NodeKind.StyleElement: {
        const buffer: Doc[] = [line, "<style>"];
        buffer.push(line, "</style>");
        return concat(buffer);
      }
      case NodeKind.Text: {
        return groupConcat([cleanWhitespace(expr.value)]);
      }
    }
  } else if (isAttribute(expr)) {
    switch (expr.kind) {
      case AttributeKind.KeyValueAttribute: {
        const buffer: Doc[] = [" ", expr.name];
        if (expr.value) {
          buffer.push("=", path.call(print, "value"));
        }

        return concat(buffer);
      }
    }
  } else if (isAttributeValue(expr)) {
    switch (expr.attrValueKind) {
      case AttributeValueKind.DyanmicString: {
        break;
      }
      case AttributeValueKind.Slot: {
        return concat(["{", "}"]);
      }
      case AttributeValueKind.String: {
        return concat(['"', expr.value, '"']);
      }
    }
  }

  return "";
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
