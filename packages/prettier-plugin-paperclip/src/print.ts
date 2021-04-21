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

const groupConcat = (contents: doc.builders.Doc[]): doc.builders.Doc => {
  return group(concat(contents));
};

export const print = (path: FastPath, options: Object, print): Doc => {
  const expr: Expression = path.getValue();

  return group(
    concat(["<a>", group(indent(concat([softline, "a", hardline]))), "</a>"])
  );
};

export const print2 = (path: FastPath, options: Object, print): Doc => {
  const expr: Expression = path.getValue();

  if (isNode(expr)) {
    switch (expr.kind) {
      case NodeKind.Fragment: {
        return group(concat(path.map(print, "children")));
      }
      case NodeKind.Element: {
        const buffer: Doc[] = ["<", expr.tagName];
        buffer.push(concat(path.map(print, "attributes")));

        if (expr.children.length) {
          buffer.push(">");
          buffer.push(indent(concat(path.map(print, "children"))));
          buffer.push(concat([softline, `</${expr.tagName}>`]));
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
          ...cleanNewLines(expr.value, true),
          cleanWhitespace(expr.value),
          ...cleanNewLines(expr.value, false)
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
