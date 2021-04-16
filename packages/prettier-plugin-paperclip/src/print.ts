import { notEqual } from "assert";
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

export const print = (path: FastPath, options: Object, print): Doc => {
  const expr: Expression = path.getValue();

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
        return concat([softline, expr.value]);
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
