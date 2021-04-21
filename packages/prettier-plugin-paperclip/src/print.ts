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

export const print = (path: FastPath, options: Object, print): Doc => {
  const expr: Expression = path.getValue();
  console.log(JSON.stringify(expr, null, 2));

  if (isNode(expr)) {
    switch (expr.kind) {
      case NodeKind.Fragment: {
        return group(concat(path.map(print, "children")));
      }
      case NodeKind.Element: {
        const buffer: Doc[] = [line, "<", expr.tagName];
        buffer.push(concat(path.map(print, "attributes")));

        if (expr.children.length) {
          buffer.push(">");
          buffer.push(indent(concat(path.map(print, "children"))));
          buffer.push(concat([line, `</${expr.tagName}>`]));
        } else {
          buffer.push(" />");
        }

        return concat(buffer);
      }
      case NodeKind.StyleElement: {
        const buffer: Doc[] = [line, "<style>"];
        // buffer.push(concat(path.map(print, "sheet")));
        buffer.push(line, "</style>");
        return concat(buffer);
      }
      case NodeKind.Text: {
        return concat([
          softline,
          cleanNewLines(expr.value, true),
          cleanWhitespace(expr.value),
          cleanNewLines(expr.value, false)
        ]);
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
  return match ? "\n".repeat(Math.min(MAX_LINES, countNewLines(match[0]))) : "";
};

const countNewLines = (ws: string) => {
  return (ws.match(/[\n\r]/g) || []).length;
};

const cleanWhitespace = (buffer: string) => {
  return buffer.trim().replace(/[\n\r\t\s]+/g, " ");
};
